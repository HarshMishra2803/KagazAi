import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  commentId: string; // Client-generated UUID matching the TipTap mark in the document
  authorId: Types.ObjectId;
  body: string;
  parentId: Types.ObjectId | null; // For threaded replies
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    commentId: {
      type: String,
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying threads and replies for a document
CommentSchema.index({ documentId: 1, commentId: 1, createdAt: 1 });

export const CommentModel = mongoose.model<IComment>('Comment', CommentSchema);
