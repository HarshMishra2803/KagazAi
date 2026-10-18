import { Server } from '@hocuspocus/server';
import jwt from 'jsonwebtoken';

export interface HocuspocusUserContext {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export function createHocuspocusServer(port: number = 1234): Server {
  return new Server({
    port,
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

        // TODO (Prompt 7): Query Permission model to verify document access (owner, editor, viewer).
        // If role === 'viewer', set connectionConfig.readOnly = true.
        // If user has no access, reject connection.

        console.log(`[hocuspocus] Authenticated ${decoded.name} (${decoded.email}) for document: ${documentName}`);

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
    async onConnect(data) {
      console.log(`[hocuspocus] Client connected to document: ${data.documentName}`);
    },
    async onDisconnect(data) {
      console.log(`[hocuspocus] Client disconnected from document: ${data.documentName}`);
    },
  });
}
