import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB, isDbConnected } from './db';
import { authRouter } from './routes/auth';
import { documentRouter } from './routes/documents';
import { createHocuspocusServer } from './hocuspocus';

// Monorepo-aware .env loader: checks cwd, apps/server directory, and parent paths
const envCandidates = [
  path.resolve(process.cwd(), 'apps/server/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
    break;
  }
}

const app = express();
const rawPort = process.env.PORT;
const portNumber = rawPort ? parseInt(rawPort, 10) : 5001;
const rawHocusPort = process.env.HOCUSPOCUS_PORT;

// In cloud environments (Render, Railway), unify Hocuspocus with PORT so both WebSockets and Express share the public port
const isCloudPaaS = Boolean(process.env.RENDER || process.env.RAILWAY_ENVIRONMENT || (rawPort && !rawHocusPort));
const hocusPortNumber = (rawHocusPort && !isCloudPaaS)
  ? parseInt(rawHocusPort, 10)
  : isCloudPaaS
  ? portNumber
  : rawHocusPort
  ? parseInt(rawHocusPort, 10)
  : 1234;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kagazai';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = CLIENT_URL.split(',').map((u) => u.trim().replace(/\/+$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      // Support preview deployments and cloud subdomains
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);
app.use('/documents', documentRouter);
app.use('/api/documents', documentRouter);

app.get('/health', (_req: Request, res: Response) => {
  const dbConnected = isDbConnected();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    app: 'KagazAi Server',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Reverse proxy to local Next.js instance (for unified all-in-one cloud deployments)
const INTERNAL_WEB_PORT = parseInt(process.env.INTERNAL_WEB_PORT || '3000', 10);
const ENABLE_WEB_PROXY = process.env.ENABLE_WEB_PROXY !== 'false';

if (ENABLE_WEB_PROXY) {
  app.use((req: Request, res: Response, next) => {
    // If request matches API or health routes, skip proxy
    if (
      req.path.startsWith('/auth') ||
      req.path.startsWith('/api') ||
      req.path.startsWith('/documents') ||
      req.path === '/health'
    ) {
      return next();
    }

    const headers = { ...req.headers };
    delete headers.host;

    let bodyData: string | Buffer | null = null;
    if (req.body && Object.keys(req.body).length > 0) {
      bodyData = JSON.stringify(req.body);
      headers['content-length'] = String(Buffer.byteLength(bodyData));
    }

    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: INTERNAL_WEB_PORT,
        path: req.url,
        method: req.method,
        headers: {
          ...headers,
          'x-forwarded-for': (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
          'x-forwarded-proto': (req.headers['x-forwarded-proto'] as string) || 'https',
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', () => {
      if (!res.headersSent) {
        res.status(502).send(
          `<html><head><title>Starting KagazAi...</title><meta http-equiv="refresh" content="3"></head><body style="font-family:system-ui,-apple-system,sans-serif;background:#fafaf9;color:#292524;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;padding:32px;background:#ffffff;border:1px solid #e7e5e4;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);max-width:440px;"><h2 style="font-size:18px;margin-bottom:8px;">Starting KagazAi Web Service</h2><p style="font-size:13px;color:#78716c;margin-bottom:16px;">The Next.js frontend is initializing in the background. This page will automatically refresh in 3 seconds.</p><div style="font-size:12px;color:#a8a29e;">KagazAi Single-Service Gateway</div></div></body></html>`
        );
      }
    });

    if (bodyData) {
      proxyReq.write(bodyData);
      proxyReq.end();
    } else {
      req.pipe(proxyReq);
    }
  });
}

async function startServer(): Promise<void> {
  try {
    await connectDB(MONGODB_URI);
  } catch {
    console.warn('[db] Initial database connection failed. Server will continue to run.');
  }

  if (hocusPortNumber === portNumber) {
    // Cloud Single-Port Mode (e.g. Render, Railway, Heroku)
    // Runs Express REST routes, Next.js web proxy, and Hocuspocus WebSockets on the exact same cloud-allocated $PORT
    try {
      const hocuspocus = createHocuspocusServer(portNumber, app);
      await hocuspocus.listen();
      console.log(`[server] KagazAi unified REST, Web, and WebSocket server listening on port ${portNumber}`);
    } catch (err) {
      console.error('[server] Failed to start unified server:', err);
    }
  } else {
    // Dual-Port Mode (Local development, Docker Compose with Nginx)
    try {
      const hocuspocus = createHocuspocusServer(hocusPortNumber);
      await hocuspocus.listen();
      console.log(`[hocuspocus] KagazAi WebSocket server listening on ws://localhost:${hocusPortNumber}`);
    } catch (err) {
      console.error('[hocuspocus] Failed to start WebSocket server:', err);
    }

    app.listen(portNumber, () => {
      console.log(`[server] KagazAi REST server listening on http://localhost:${portNumber}`);
    });
  }
}

startServer();
