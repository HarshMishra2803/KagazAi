import { Router, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { DocumentModel } from '../models/Document';
import { PermissionModel } from '../models/Permission';
import { VersionModel } from '../models/Version';
import { CommentModel } from '../models/Comment';
import { permissionsRouter } from './permissions';
import { versionsRouter } from './versions';
import { commentsRouter } from './comments';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const documentRouter = Router();

// Protect all document routes with authentication
documentRouter.use(requireAuth);

// Mount nested permissions router on /documents/:id/permissions
documentRouter.use('/:id/permissions', permissionsRouter);

// Mount nested versions router on /documents/:id/versions
documentRouter.use('/:id/versions', versionsRouter);

// Mount nested comments router on /documents/:id/comments
documentRouter.use('/:id/comments', commentsRouter);

const renameSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(120, 'Title cannot exceed 120 characters'),
});

const createSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, 'Title cannot exceed 120 characters')
    .optional(),
});

function getParamId(param: string | string[] | undefined): string | null {
  if (!param) return null;
  const id = Array.isArray(param) ? param[0] : param;
  return typeof id === 'string' && Types.ObjectId.isValid(id) ? id : null;
}

// POST /documents - Create a new document
documentRouter.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createSchema.safeParse(req.body);
    const title = parseResult.success && parseResult.data.title
      ? parseResult.data.title
      : 'Untitled Document';

    const document = await DocumentModel.create({
      title,
      ownerId: req.user?.id,
    });

    res.status(201).json({
      document: {
        ...document.toObject(),
        role: 'owner',
      },
    });
  } catch (err) {
    console.error('[documents] Create error:', err);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// GET /documents - List all documents owned by or shared with current user
documentRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // 1. Owned documents
    const ownedDocs = await DocumentModel.find({ ownerId: userId })
      .sort({ updatedAt: -1 })
      .lean();

    const ownedWithRole = ownedDocs.map((doc) => ({
      ...doc,
      role: 'owner' as const,
    }));

    // 2. Shared documents (where user has an active permission record)
    const permissions = await PermissionModel.find({ userId })
      .populate('documentId')
      .lean();

    const sharedWithRole = permissions
      .filter((p) => p.documentId != null)
      .map((p) => {
        const docObj = p.documentId as any;
        return {
          ...docObj,
          role: p.role,
        };
      });

    // Merge and sort all accessible documents by updatedAt descending
    const documents = [...ownedWithRole, ...sharedWithRole].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.status(200).json({ documents });
  } catch (err) {
    console.error('[documents] List error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET /documents/:id - Get a specific document if owned or shared
documentRouter.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!id) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const document = await DocumentModel.findById(id).lean();

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const userId = req.user?.id!;
    let role: 'owner' | 'editor' | 'viewer' | null = null;

    if (document.ownerId.toString() === userId) {
      role = 'owner';
    } else if (document.publicAccess === 'edit') {
      role = 'editor';
      // Auto-record / upgrade permission for link visitor so document appears on their dashboard as editor
      try {
        await PermissionModel.findOneAndUpdate(
          { documentId: id, userId },
          { role: 'editor' },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (_) {}
    } else {
      const perm = await PermissionModel.findOne({
        documentId: id,
        userId,
      }).lean();

      if (perm) {
        role = perm.role;
      } else if (document.publicAccess === 'view' || !document.publicAccess) {
        role = 'viewer';
        // Auto-record permission for link visitor so document appears on their dashboard
        try {
          await PermissionModel.findOneAndUpdate(
            { documentId: id, userId },
            { role: 'viewer' },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } catch (_) {}
      }
    }

    if (!role) {
      // Return 404 to avoid leaking document existence to unpermitted users (IDOR protection)
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.status(200).json({
      document: {
        ...document,
        role,
      },
    });
  } catch (err) {
    console.error('[documents] Get error:', err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// PATCH /documents/:id - Rename a document (only owner or editor)
documentRouter.patch('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!id) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const parseResult = renameSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: parseResult.error.issues[0]?.message || 'Invalid title',
    });
    return;
  }

  try {
    const document = await DocumentModel.findById(id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const userId = req.user?.id!;
    let role: 'owner' | 'editor' | 'viewer' | null = null;

    if (document.ownerId.toString() === userId) {
      role = 'owner';
    } else if (document.publicAccess === 'edit') {
      role = 'editor';
    } else {
      const perm = await PermissionModel.findOne({
        documentId: id,
        userId,
      });

      if (perm) {
        role = perm.role;
      } else if (document.publicAccess === 'view' || !document.publicAccess) {
        role = 'viewer';
      }
    }

    if (!role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (role === 'viewer') {
      res.status(403).json({ error: 'Viewers cannot rename documents' });
      return;
    }

    document.title = parseResult.data.title;
    await document.save();

    res.status(200).json({
      document: {
        ...document.toObject(),
        role,
      },
    });
  } catch (err) {
    console.error('[documents] Update error:', err);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE /documents/:id - Delete a document (owner only)
documentRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!id) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const document = await DocumentModel.findById(id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const userId = req.user?.id!;

    if (document.ownerId.toString() !== userId) {
      res.status(403).json({ error: 'Only the document owner can delete this document' });
      return;
    }

    // Delete document and all associated permissions, versions, and comments
    await DocumentModel.findByIdAndDelete(id);
    await PermissionModel.deleteMany({ documentId: id });
    await VersionModel.deleteMany({ documentId: id });
    await CommentModel.deleteMany({ documentId: id });

    res.status(200).json({ message: 'Document deleted successfully', id });
  } catch (err) {
    console.error('[documents] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

