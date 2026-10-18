import { Router, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { DocumentModel } from '../models/Document';
import { PermissionModel } from '../models/Permission';
import { User } from '../models/User';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const permissionsRouter = Router({ mergeParams: true });

permissionsRouter.use(requireAuth);

const inviteSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  role: z.enum(['editor', 'viewer'], {
    message: 'Role must be either editor or viewer',
  }),
});

const updateRoleSchema = z.object({
  role: z.enum(['editor', 'viewer'], {
    message: 'Role must be either editor or viewer',
  }),
});

function getParamId(param: string | string[] | undefined): string | null {
  if (!param) return null;
  const id = Array.isArray(param) ? param[0] : param;
  return typeof id === 'string' && Types.ObjectId.isValid(id) ? id : null;
}

// Helper to check user's role on document
async function getDocumentAndRole(
  documentId: string,
  userId: string
): Promise<{ doc: any; role: 'owner' | 'editor' | 'viewer' | null }> {
  const doc = await DocumentModel.findById(documentId).populate('ownerId', 'name email');
  if (!doc) return { doc: null, role: null };

  const ownerIdStr = doc.ownerId?._id
    ? doc.ownerId._id.toString()
    : doc.ownerId
    ? doc.ownerId.toString()
    : '';
  if (ownerIdStr === userId) {
    return { doc, role: 'owner' };
  }

  const perm = await PermissionModel.findOne({ documentId: doc._id, userId });
  if (perm) {
    return { doc, role: perm.role };
  }

  if (doc.publicAccess === 'edit') {
    return { doc, role: 'editor' };
  }
  if (doc.publicAccess === 'view' || !doc.publicAccess) {
    return { doc, role: 'viewer' };
  }

  return { doc, role: null };
}

// GET /documents/:id/permissions - List collaborators
permissionsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  if (!documentId) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  try {
    const { doc, role } = await getDocumentAndRole(documentId, req.user?.id!);
    if (!doc || !role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const permissions = await PermissionModel.find({ documentId: doc._id })
      .populate('userId', 'name email')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: 1 })
      .lean();

    const ownerUser = doc.ownerId as any;
    const ownerUserId = ownerUser?._id ? ownerUser._id.toString() : (ownerUser?.toString() || 'unknown');
    const ownerName = ownerUser?.name || 'Document Owner';
    const ownerEmail = ownerUser?.email || '';

    const collaborators = [
      {
        userId: ownerUserId,
        name: ownerName,
        email: ownerEmail,
        role: 'owner',
        isOwner: true,
      },
      ...permissions
        .filter((p) => p.userId != null)
        .map((p) => {
          const u = p.userId as any;
          return {
            userId: u._id.toString(),
            name: u.name,
            email: u.email,
            role: p.role,
            isOwner: false,
            invitedBy: (p.invitedBy as any)?.name || 'Unknown',
            createdAt: p.createdAt,
          };
        }),
    ];

    res.status(200).json({
      collaborators,
      currentUserRole: role,
      publicAccess: doc.publicAccess || 'view',
    });
  } catch (err) {
    console.error('[permissions] Get error:', err);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

// POST /documents/:id/permissions - Invite a collaborator by email
permissionsRouter.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  if (!documentId) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const parseResult = inviteSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: parseResult.error.issues[0]?.message || 'Invalid invite request',
    });
    return;
  }

  try {
    const { doc, role } = await getDocumentAndRole(documentId, req.user?.id!);
    if (!doc || !role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Only owner can invite new collaborators
    if (role !== 'owner') {
      res.status(403).json({ error: 'Only the document owner can invite collaborators' });
      return;
    }

    const { email, role: invitedRole } = parseResult.data;

    // Look up user by email
    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      res.status(404).json({
        error: `No KagazAi account found for email: ${email}`,
      });
      return;
    }

    const ownerIdStr = doc.ownerId instanceof Types.ObjectId ? doc.ownerId.toString() : (doc.ownerId as any)._id.toString();
    if (targetUser._id.toString() === ownerIdStr) {
      res.status(400).json({ error: 'You are already the owner of this document' });
      return;
    }

    // Upsert permission record
    const permission = await PermissionModel.findOneAndUpdate(
      { documentId: doc._id, userId: targetUser._id },
      {
        role: invitedRole,
        invitedBy: req.user?.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      message: `Collaborator ${targetUser.name} added as ${invitedRole}`,
      collaborator: {
        userId: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: permission.role,
        isOwner: false,
      },
    });
  } catch (err) {
    console.error('[permissions] Invite error:', err);
    res.status(500).json({ error: 'Failed to invite collaborator' });
  }
});

// PATCH /documents/:id/permissions/:userId - Change collaborator role
permissionsRouter.patch('/:userId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  const targetUserId = getParamId(req.params.userId);

  if (!documentId || !targetUserId) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const parseResult = updateRoleSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: parseResult.error.issues[0]?.message || 'Invalid role',
    });
    return;
  }

  try {
    const { doc, role } = await getDocumentAndRole(documentId, req.user?.id!);
    if (!doc || !role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (role !== 'owner') {
      res.status(403).json({ error: 'Only the document owner can change roles' });
      return;
    }

    const ownerIdStr = doc.ownerId instanceof Types.ObjectId ? doc.ownerId.toString() : (doc.ownerId as any)._id.toString();
    if (targetUserId === ownerIdStr) {
      res.status(400).json({ error: 'Cannot change the owner role' });
      return;
    }

    const updated = await PermissionModel.findOneAndUpdate(
      { documentId: doc._id, userId: targetUserId },
      { role: parseResult.data.role },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'Collaborator permission not found' });
      return;
    }

    res.status(200).json({
      message: 'Role updated successfully',
      role: updated.role,
    });
  } catch (err) {
    console.error('[permissions] Update role error:', err);
    res.status(500).json({ error: 'Failed to update collaborator role' });
  }
});

// DELETE /documents/:id/permissions/:userId - Remove collaborator access
permissionsRouter.delete('/:userId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  const targetUserId = getParamId(req.params.userId);

  if (!documentId || !targetUserId) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  try {
    const { doc, role } = await getDocumentAndRole(documentId, req.user?.id!);
    if (!doc || !role) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Owner can remove anyone; non-owners can only remove themselves
    const isSelfRemoval = req.user?.id === targetUserId;
    if (role !== 'owner' && !isSelfRemoval) {
      res.status(403).json({ error: 'Only the document owner can remove collaborators' });
      return;
    }

    const ownerIdStr = doc.ownerId instanceof Types.ObjectId ? doc.ownerId.toString() : (doc.ownerId as any)._id.toString();
    if (targetUserId === ownerIdStr) {
      res.status(400).json({ error: 'Cannot remove the document owner' });
      return;
    }

    const deleted = await PermissionModel.findOneAndDelete({
      documentId: doc._id,
      userId: targetUserId,
    });

    if (!deleted) {
      res.status(404).json({ error: 'Collaborator permission not found' });
      return;
    }

    res.status(200).json({ message: 'Collaborator access removed successfully' });
  } catch (err) {
    console.error('[permissions] Delete error:', err);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

// PATCH /documents/:id/permissions/public-access - Change link sharing mode (owner only)
permissionsRouter.patch('/public-access', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const documentId = getParamId(req.params.id);
  if (!documentId) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const parseResult = z.object({
    publicAccess: z.enum(['private', 'view', 'edit']),
  }).safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid public access level. Allowed: private, view, edit' });
    return;
  }

  try {
    const { doc, role } = await getDocumentAndRole(documentId, req.user?.id!);
    if (!doc || role !== 'owner') {
      res.status(403).json({ error: 'Only the document owner can change access settings' });
      return;
    }

    doc.publicAccess = parseResult.data.publicAccess;
    await doc.save();

    res.status(200).json({
      message: 'Access setting updated successfully',
      publicAccess: doc.publicAccess,
    });
  } catch (err) {
    console.error('[permissions] Public access update error:', err);
    res.status(500).json({ error: 'Failed to update access setting' });
  }
});

