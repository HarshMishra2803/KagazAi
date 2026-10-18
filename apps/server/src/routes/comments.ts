import { Router, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { CommentModel } from '../models/Comment';
import { DocumentModel } from '../models/Document';
import { PermissionModel } from '../models/Permission';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const commentsRouter = Router({ mergeParams: true });

// Require authentication for all comment routes
commentsRouter.use(requireAuth);

function getParamId(param: string | string[] | undefined): string | null {
  if (!param) return null;
  const id = Array.isArray(param) ? param[0] : param;
  return typeof id === 'string' && Types.ObjectId.isValid(id) ? id : null;
}

/**
 * Helper to determine a user's role on a document:
 * returns 'owner' | 'editor' | 'viewer' | null
 */
async function getUserRole(
  documentId: string,
  userId: string
): Promise<'owner' | 'editor' | 'viewer' | null> {
  const doc = await DocumentModel.findById(documentId).select('ownerId publicAccess');
  if (!doc) return null;

  if (doc.ownerId.toString() === userId) {
    return 'owner';
  }

  if (doc.publicAccess === 'edit') {
    return 'editor';
  }

  const perm = await PermissionModel.findOne({ documentId, userId });
  if (perm) {
    return perm.role;
  }

  if (doc.publicAccess === 'view' || !doc.publicAccess) {
    return 'viewer';
  }

  return null;
}

const createCommentSchema = z.object({
  commentId: z.string().trim().min(1, 'commentId is required'),
  body: z.string().trim().min(1, 'Comment body cannot be empty').max(2000, 'Comment cannot exceed 2000 characters'),
  parentId: z.string().trim().optional(),
});

const resolveCommentSchema = z.object({
  resolved: z.boolean(),
});

// GET /documents/:id/comments - List all comments and replies
commentsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  if (!documentId) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const role = await getUserRole(documentId, req.user!.id);
    if (!role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const comments = await CommentModel.find({ documentId })
      .populate('authorId', 'name email')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ comments });
  } catch (err) {
    console.error('[comments] List error:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /documents/:id/comments - Create a new comment or reply
commentsRouter.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  if (!documentId) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const role = await getUserRole(documentId, req.user!.id);
    if (!role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (role === 'viewer') {
      res.status(403).json({ error: 'Viewers cannot create comments or replies' });
      return;
    }

    const parseResult = createCommentSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { commentId, body, parentId } = parseResult.data;
    let parentObjectId: Types.ObjectId | null = null;

    if (parentId && Types.ObjectId.isValid(parentId)) {
      parentObjectId = new Types.ObjectId(parentId);
    }

    const newComment = await CommentModel.create({
      documentId,
      commentId,
      authorId: req.user!.id,
      body,
      parentId: parentObjectId,
      resolved: false,
    });

    const populated = await newComment.populate('authorId', 'name email');

    res.status(201).json({
      message: 'Comment created successfully',
      comment: populated,
    });
  } catch (err) {
    console.error('[comments] Create error:', err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// PATCH /documents/:id/comments/:commentId/resolve - Resolve or unresolve a comment thread
commentsRouter.patch('/:commentId/resolve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  const commentId = req.params.commentId;

  if (!documentId || !commentId) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  try {
    const role = await getUserRole(documentId, req.user!.id);
    if (!role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (role === 'viewer') {
      res.status(403).json({ error: 'Viewers cannot resolve comments' });
      return;
    }

    const parseResult = resolveCommentSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid resolve payload' });
      return;
    }

    const { resolved } = parseResult.data;

    // Resolve all entries belonging to this thread
    await CommentModel.updateMany(
      { documentId, commentId },
      { resolved }
    );

    res.status(200).json({
      message: `Thread ${resolved ? 'resolved' : 're-opened'}`,
      commentId,
      resolved,
    });
  } catch (err) {
    console.error('[comments] Resolve error:', err);
    res.status(500).json({ error: 'Failed to update resolve status' });
  }
});

// DELETE /documents/:id/comments/:commentId - Delete comment thread or single comment
commentsRouter.delete('/:commentId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  const rawParam = req.params.commentId;
  const commentIdOrMongoId = Array.isArray(rawParam) ? rawParam[0] : rawParam;

  if (!documentId || !commentIdOrMongoId || typeof commentIdOrMongoId !== 'string') {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  try {
    const role = await getUserRole(documentId, req.user!.id);
    if (!role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Try finding by _id or by commentId string
    let query: any = { documentId };
    if (Types.ObjectId.isValid(commentIdOrMongoId)) {
      query._id = commentIdOrMongoId;
    } else {
      query.commentId = commentIdOrMongoId;
    }

    const comment = await CommentModel.findOne(query);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Only comment author or document owner can delete
    if (role !== 'owner' && comment.authorId.toString() !== req.user!.id) {
      res.status(403).json({ error: 'You do not have permission to delete this comment' });
      return;
    }

    if (comment.parentId) {
      // It's a single reply
      await CommentModel.findByIdAndDelete(comment._id);
    } else {
      // It's a thread root; delete entire thread and its replies
      await CommentModel.deleteMany({ documentId, commentId: comment.commentId });
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('[comments] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});
