import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB, isDbConnected } from './db';
import { authRouter } from './routes/auth';
import { documentRouter } from './routes/documents';

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
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kagazai';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/documents', documentRouter);

app.get('/health', (_req: Request, res: Response) => {
  const dbConnected = isDbConnected();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    app: 'KagazAi Server',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

async function startServer(): Promise<void> {
  try {
    await connectDB(MONGODB_URI);
  } catch {
    console.warn('[db] Initial database connection failed. Server will continue to run.');
  }

  app.listen(PORT, () => {
    console.log(`[server] KagazAi server listening on http://localhost:${PORT}`);
  });
}

startServer();
