import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVersion extends Document {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  label: string;
  state: Buffer;
  plainText: string;
}

const VersionSchema = new Schema<IVersion>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: 'Auto-save version',
    },
    state: {
      type: Buffer,
      required: true,
    },
    plainText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for querying chronological version history of a document
VersionSchema.index({ documentId: 1, createdAt: -1 });

export const VersionModel = mongoose.model<IVersion>('Version', VersionSchema);
