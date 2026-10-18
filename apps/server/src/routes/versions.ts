import { Router, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { VersionModel } from '../models/Version';
import { DocumentModel } from '../models/Document';
import { PermissionModel } from '../models/Permission';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { restoreVersionToLiveDocument } from '../hocuspocus';

export const versionsRouter = Router({ mergeParams: true });

// Require authentication for all version operations
versionsRouter.use(requireAuth);

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

  const perm = await PermissionModel.findOne({ documentId, userId });
  if (perm) return perm.role;

  if (doc.publicAccess === 'edit') return 'editor';
  if (doc.publicAccess === 'view' || !doc.publicAccess) return 'viewer';

  return null;
}

const saveVersionSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Label cannot be empty')
    .max(100, 'Label cannot exceed 100 characters'),
});

// GET /documents/:id/versions - List all versions for document
versionsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const versions = await VersionModel.find({ documentId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .select('_id label createdAt plainText createdBy')
      .lean();

    res.status(200).json({ versions });
  } catch (err) {
    console.error('[versions] List error:', err);
    res.status(500).json({ error: 'Failed to fetch version history' });
  }
});

// POST /documents/:id/versions - Manually save a named version
versionsRouter.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      res.status(403).json({ error: 'Viewers cannot create version snapshots' });
      return;
    }

    const parseResult = saveVersionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const state = doc.content && doc.content.length > 0 ? doc.content : Buffer.from(new Uint8Array());
    const plainText = doc.plainText || '';

    const newVersion = await VersionModel.create({
      documentId,
      createdBy: req.user!.id,
      label: parseResult.data.label,
      state,
      plainText,
    });

    const populated = await newVersion.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Version created successfully',
      version: {
        _id: populated._id,
        label: populated.label,
        createdAt: populated.createdAt,
        plainText: populated.plainText,
        createdBy: populated.createdBy,
      },
    });
  } catch (err) {
    console.error('[versions] Create error:', err);
    res.status(500).json({ error: 'Failed to save version' });
  }
});

// GET /documents/:id/versions/:versionId - Retrieve version preview details
versionsRouter.get('/:versionId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  const versionId = getParamId(req.params.versionId);

  if (!documentId || !versionId) {
    res.status(404).json({ error: 'Version not found' });
    return;
  }

  try {
    const role = await getUserRole(documentId, req.user!.id);
    if (!role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const version = await VersionModel.findOne({
      _id: versionId,
      documentId,
    })
      .populate('createdBy', 'name email')
      .lean();

    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    res.status(200).json({
      version: {
        _id: version._id,
        label: version.label,
        createdAt: version.createdAt,
        plainText: version.plainText,
        createdBy: version.createdBy,
      },
    });
  } catch (err) {
    console.error('[versions] Get error:', err);
    res.status(500).json({ error: 'Failed to retrieve version' });
  }
});

// POST /documents/:id/versions/:versionId/restore - Restore document to historical version
versionsRouter.post('/:versionId/restore', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  const versionId = getParamId(req.params.versionId);

  if (!documentId || !versionId) {
    res.status(404).json({ error: 'Version not found' });
    return;
  }

  try {
    const role = await getUserRole(documentId, req.user!.id);
    if (!role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (role === 'viewer') {
      res.status(403).json({ error: 'Viewers cannot restore versions' });
      return;
    }

    const versionToRestore = await VersionModel.findOne({
      _id: versionId,
      documentId,
    });

    if (!versionToRestore) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    // 1. Snapshot the current document state before restoring, so user never loses current work
    const currentDoc = await DocumentModel.findById(documentId);
    if (currentDoc && currentDoc.content && currentDoc.content.length > 0) {
      await VersionModel.create({
        documentId,
        createdBy: req.user!.id,
        label: `Snapshot before restoring "${versionToRestore.label}"`,
        state: currentDoc.content,
        plainText: currentDoc.plainText || '',
      });
    }

    // 2. Apply restore as a forward edit on the live in-memory Y.Doc so connected users see it update live
    await restoreVersionToLiveDocument(
      documentId,
      versionToRestore.state,
      req.user!.id
    );

    res.status(200).json({
      message: `Document successfully restored to "${versionToRestore.label}"`,
      restoredVersion: {
        _id: versionToRestore._id,
        label: versionToRestore.label,
      },
    });
  } catch (err) {
    console.error('[versions] Restore error:', err);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

// DELETE /documents/:id/versions/:versionId - Delete a version snapshot (owner or editor)
versionsRouter.delete('/:versionId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  const versionId = getParamId(req.params.versionId);

  if (!documentId || !versionId) {
    res.status(404).json({ error: 'Version not found' });
    return;
  }

  try {
    const role = await getUserRole(documentId, req.user!.id);
    if (!role || (role !== 'owner' && role !== 'editor')) {
      res.status(403).json({ error: 'Only owners and editors can delete versions' });
      return;
    }

    const deleted = await VersionModel.findOneAndDelete({
      _id: versionId,
      documentId,
    });

    if (!deleted) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    res.status(200).json({ message: 'Version deleted successfully', versionId });
  } catch (err) {
    console.error('[versions] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete version' });
  }
});

