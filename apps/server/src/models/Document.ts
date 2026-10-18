import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface IDocument extends MongooseDocument {
  title: string;
  ownerId: Types.ObjectId;
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
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch user's documents sorted by last updated
documentSchema.index({ ownerId: 1, updatedAt: -1 });

export const DocumentModel = model<IDocument>('Document', documentSchema);
