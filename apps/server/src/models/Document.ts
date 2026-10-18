import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface IDocument extends MongooseDocument {
  title: string;
  ownerId: Types.ObjectId;
  publicAccess: 'private' | 'view' | 'edit';
  content?: Buffer | null;
  plainText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled Document',
      maxlength: 120,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Indexed for O(log N) query performance per owner
    },
    publicAccess: {
      type: String,
      enum: ['private', 'view', 'edit'],
      default: 'edit', // 'private' = only explicit collaborators; 'view' = anyone with link can view; 'edit' = anyone with link can edit
    },
    content: {
      type: Buffer,
      default: null, // Binary Yjs CRDT state vector
    },
    plainText: {
      type: String,
      default: '', // Plain-text copy for future search indexing
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch user's documents sorted by last updated
documentSchema.index({ ownerId: 1, updatedAt: -1 });

export const DocumentModel = model<IDocument>('Document', documentSchema);
