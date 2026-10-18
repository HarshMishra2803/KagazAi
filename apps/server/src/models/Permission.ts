import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export type DocumentRole = 'owner' | 'editor' | 'viewer';

export interface IPermission extends MongooseDocument {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  role: DocumentRole;
  invitedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      required: true,
      default: 'editor',
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: A user can hold only one permission role per document
permissionSchema.index({ documentId: 1, userId: 1 }, { unique: true });

export const PermissionModel = model<IPermission>('Permission', permissionSchema);
