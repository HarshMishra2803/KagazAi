import { Server } from '@hocuspocus/server';
import jwt from 'jsonwebtoken';
import * as Y from 'yjs';
import mongoose from 'mongoose';
import { DocumentModel } from './models/Document';
import { PermissionModel } from './models/Permission';

export interface HocuspocusUserContext {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Recursively extracts plain text from a Y.Doc's default XML fragment.
 * Traverses ProseMirror XML elements and text nodes to generate searchable text.
 */
export function extractPlainTextFromDoc(ydoc: Y.Doc): string {
  try {
    const fragment = ydoc.getXmlFragment('default');
    const extract = (item: any): string => {
      if (!item) return '';
      if (item instanceof Y.XmlText) {
        return item.toString();
      }
      if (item instanceof Y.XmlElement || item instanceof Y.XmlFragment) {
        const parts: string[] = [];
        for (let i = 0; i < item.length; i++) {
          const childText = extract(item.get(i));
          if (childText) parts.push(childText);
        }
        return parts.join('\n');
      }
      return '';
    };
    return extract(fragment).trim();
  } catch (err) {
    console.warn('[hocuspocus] Failed to extract plain text from Y.Doc:', err);
    return '';
  }
}

export function createHocuspocusServer(port: number = 1234): Server {
  return new Server({
    port,
    debounce: 2000, // Debounce document persistence to MongoDB by 2 seconds
    maxDebounce: 10000, // Force save after at most 10 seconds of continuous editing

    async onAuthenticate(data) {
      const { token, documentName } = data;

      // Extract token from direct token payload or fallback cookie
      let candidateToken = token;

      if (!candidateToken && data.requestHeaders) {
        const cookieHeader = data.requestHeaders.get('cookie') || '';
        const match = cookieHeader.match(/token=([^;]+)/);
        if (match) {
          candidateToken = match[1];
        }
      }

      if (!candidateToken) {
        console.warn(`[hocuspocus] Rejecting unauthenticated connection to room: ${documentName}`);
        throw new Error('Authentication required');
      }

      const secret = process.env.JWT_SECRET || 'kagazai_development_secret_key_32_characters_minimum';

      try {
        const decoded = jwt.verify(candidateToken, secret) as HocuspocusUserContext['user'];

        if (!mongoose.isValidObjectId(documentName)) {
          throw new Error('Invalid document ID');
        }

        // Query Document and Permissions to enforce access control
        const doc = await DocumentModel.findById(documentName);
        if (!doc) {
          throw new Error('Document not found');
        }

        let role: 'owner' | 'editor' | 'viewer' | null = null;

        if (doc.ownerId.toString() === decoded.id) {
          role = 'owner';
        } else {
          const perm = await PermissionModel.findOne({
            documentId: doc._id,
            userId: decoded.id,
          });
          if (perm) {
            role = perm.role;
          }
        }

        if (!role) {
          console.warn(`[hocuspocus] User ${decoded.name} (${decoded.id}) has no permission for doc ${documentName}`);
          throw new Error('Access denied: You do not have permission to view or edit this document');
        }

        if (role === 'viewer') {
          data.connectionConfig.readOnly = true;
          console.log(`[hocuspocus] Read-only viewer mode enforced for ${decoded.name} in document ${documentName}`);
        }

        console.log(`[hocuspocus] Authenticated ${decoded.name} (${role}) for document: ${documentName}`);

        return {
          user: {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
          },
        };
      } catch (err) {
        console.warn(`[hocuspocus] JWT verification failed for room ${documentName}:`, err);
        throw new Error('Invalid or expired authentication token');
      }
    },

    async onLoadDocument(data) {
      const { documentName } = data;

      if (!mongoose.isValidObjectId(documentName)) {
        console.warn(`[hocuspocus] Invalid document ID requested in onLoadDocument: ${documentName}`);
        return null;
      }

      try {
        const doc = await DocumentModel.findById(documentName);

        if (doc && doc.content && doc.content.length > 0) {
          console.log(`[hocuspocus] Loaded document ${documentName} from MongoDB (${doc.content.length} bytes)`);
          // Return binary state as Uint8Array for Hocuspocus to initialize the Y.Doc
          return new Uint8Array(doc.content);
        }

        console.log(`[hocuspocus] New document or empty content for ${documentName}; starting fresh Y.Doc`);
        return null;
      } catch (err) {
        console.error(`[hocuspocus] Error loading document ${documentName} from MongoDB:`, err);
        throw err;
      }
    },

    async onStoreDocument(data) {
      const { documentName, document } = data;

      if (!mongoose.isValidObjectId(documentName)) {
        console.warn(`[hocuspocus] Invalid document ID in onStoreDocument: ${documentName}`);
        return;
      }

      try {
        // Encode Y.Doc into compact binary update
        const stateUpdate = Y.encodeStateAsUpdate(document);
        const buffer = Buffer.from(stateUpdate);
        const plainText = extractPlainTextFromDoc(document);

        await DocumentModel.findByIdAndUpdate(
          documentName,
          {
            content: buffer,
            plainText,
          },
          { new: true }
        );

        console.log(
          `[hocuspocus] Persisted document ${documentName} to MongoDB (${buffer.length} bytes, ${plainText.length} text chars)`
        );
      } catch (err) {
        console.error(`[hocuspocus] Error persisting document ${documentName} to MongoDB:`, err);
        throw err;
      }
    },

    async onConnect(data) {
      console.log(`[hocuspocus] Client connected to document: ${data.documentName}`);
    },

    async onDisconnect(data) {
      console.log(`[hocuspocus] Client disconnected from document: ${data.documentName}`);
    },
  });
}
