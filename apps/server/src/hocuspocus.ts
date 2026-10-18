import { Server } from '@hocuspocus/server';
import { Redis as RedisExtension } from '@hocuspocus/extension-redis';
import jwt from 'jsonwebtoken';
import * as Y from 'yjs';
import mongoose from 'mongoose';
import { DocumentModel } from './models/Document';
import { PermissionModel } from './models/Permission';
import { VersionModel } from './models/Version';

export interface HocuspocusUserContext {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export let hocuspocusServerInstance: Server | null = null;

export function getHocuspocusServer(): Server | null {
  return hocuspocusServerInstance;
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
  const redisHost = process.env.REDIS_HOST;
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const extensions: any[] = [];

  if (redisHost) {
    console.log(`[hocuspocus] Enabling Redis pub/sub extension on ${redisHost}:${redisPort} (port ${port})`);
    extensions.push(
      new RedisExtension({
        host: redisHost,
        port: redisPort,
        prefix: 'kagazai:collab',
        identifier: `server_${port}_${Math.random().toString(36).substring(2, 7)}`,
      })
    );
  }

  const server = new Server({
    port,
    extensions,
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
          } else if (doc.publicAccess === 'edit') {
            role = 'editor';
          } else if (doc.publicAccess === 'view' || !doc.publicAccess) {
            role = 'viewer';
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
          try {
            const candidateUpdate = new Uint8Array(doc.content);
            // Verify binary update is strictly decodable before passing to Hocuspocus
            const testDoc = new Y.Doc();
            Y.applyUpdate(testDoc, candidateUpdate);
            testDoc.destroy();

            console.log(`[hocuspocus] Loaded document ${documentName} from MongoDB (${doc.content.length} bytes)`);
            return candidateUpdate;
          } catch (decodeErr) {
            console.warn(
              `[hocuspocus] Document ${documentName} had malformed binary content in MongoDB. Initializing fresh Y.Doc to prevent client crash loops:`,
              decodeErr
            );
            return null;
          }
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

        // Automated version snapshot: create at most every 10 minutes during active editing
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentVersion = await VersionModel.findOne({
          documentId: documentName,
          createdAt: { $gte: tenMinutesAgo },
        });

        if (!recentVersion) {
          const doc = await DocumentModel.findById(documentName).select('ownerId');
          if (doc) {
            await VersionModel.create({
              documentId: documentName,
              createdBy: doc.ownerId,
              label: 'Auto-save version',
              state: buffer,
              plainText,
            });
            console.log(`[hocuspocus] Auto-snapshot version created for document: ${documentName}`);
          }
        }
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

  hocuspocusServerInstance = server;
  return server;
}

/**
 * Recursively clones a ProseMirror Yjs XML node/element/text to apply cleanly into a destination document.
 */
export function cloneYjsItem(item: any): any {
  if (item instanceof Y.XmlElement) {
    const el = new Y.XmlElement(item.nodeName);
    const attrs = item.getAttributes();
    for (const k in attrs) {
      el.setAttribute(k, attrs[k]);
    }
    const children: any[] = [];
    for (let i = 0; i < item.length; i++) {
      children.push(cloneYjsItem(item.get(i)));
    }
    el.insert(0, children.filter(Boolean));
    return el;
  } else if (item instanceof Y.XmlText) {
    const text = new Y.XmlText();
    text.applyDelta(item.toDelta());
    return text;
  }
  return null;
}

/**
 * Restores a document to a historical version by applying its content as a forward edit
 * on the live in-memory Y.Doc. This ensures all currently connected WebSocket peers
 * receive the update in real time without disconnection.
 */
export async function restoreVersionToLiveDocument(
  documentId: string,
  versionState: Buffer,
  restoredByUserId: string
): Promise<void> {
  // 1. Rehydrate historical Y.Doc from version binary update
  const historicalDoc = new Y.Doc();
  Y.applyUpdate(historicalDoc, new Uint8Array(versionState));
  const historicalFrag = historicalDoc.getXmlFragment('default');
  const plainText = extractPlainTextFromDoc(historicalDoc);

  // 2. Persist restored state immediately to MongoDB so newly joined clients load it reliably
  const buffer = Buffer.from(versionState);
  await DocumentModel.findByIdAndUpdate(documentId, {
    content: buffer,
    plainText,
  });

  // 3. Apply live forward-delta to currently active in-memory room
  const server = getHocuspocusServer();
  if (server) {
    try {
      const hocuspocusCore = (server as any).hocuspocus || server;
      if (typeof hocuspocusCore.openDirectConnection === 'function') {
        const connection = await hocuspocusCore.openDirectConnection(documentId, {
          user: { id: restoredByUserId, name: 'System Restore', email: 'system@kagaz.ai' },
        });

        try {
          await connection.transact((liveDoc: Y.Doc) => {
            const liveFrag = liveDoc.getXmlFragment('default');
            // Clear current live contents
            liveFrag.delete(0, liveFrag.length);

            // Clone historical nodes into live fragment as a forward delta
            const clones: any[] = [];
            for (let i = 0; i < historicalFrag.length; i++) {
              clones.push(cloneYjsItem(historicalFrag.get(i)));
            }
            liveFrag.insert(0, clones.filter(Boolean));
          });
        } finally {
          connection.disconnect();
        }
      }
    } catch (liveErr) {
      console.warn(`[hocuspocus] Live socket forward-delta skipped (document saved to DB):`, liveErr);
    }
  }
}
