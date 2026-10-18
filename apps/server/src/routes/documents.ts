import { Router, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { DocumentModel } from '../models/Document';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const documentRouter = Router();

// Protect all document routes with authentication
documentRouter.use(requireAuth);

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

    res.status(201).json({ document });
  } catch (err) {
    console.error('[documents] Create error:', err);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// GET /documents - List all documents owned by current user
documentRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const documents = await DocumentModel.find({ ownerId: req.user?.id })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ documents });
  } catch (err) {
    console.error('[documents] List error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET /documents/:id - Get a specific document owned by current user
documentRouter.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!id) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const document = await DocumentModel.findOne({
      _id: id,
      ownerId: req.user?.id,
    }).lean();

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.status(200).json({ document });
  } catch (err) {
    console.error('[documents] Get error:', err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// PATCH /documents/:id - Rename a document owned by current user
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
    const document = await DocumentModel.findOneAndUpdate(
      {
        _id: id,
        ownerId: req.user?.id,
      },
      {
        title: parseResult.data.title,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.status(200).json({ document });
  } catch (err) {
    console.error('[documents] Update error:', err);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE /documents/:id - Delete a document owned by current user
documentRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = getParamId(req.params.id);

  if (!id) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const deleted = await DocumentModel.findOneAndDelete({
      _id: id,
      ownerId: req.user?.id,
    });

    if (!deleted) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.status(200).json({ message: 'Document deleted successfully', id });
  } catch (err) {
    console.error('[documents] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});
