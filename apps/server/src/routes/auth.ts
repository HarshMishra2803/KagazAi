import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  };
}

function generateToken(payload: { id: string; email: string; name: string }): string {
  const secret = process.env.JWT_SECRET || 'kagazai_development_secret_key_32_characters_minimum';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// POST /auth/register
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: parseResult.error.issues[0]?.message || 'Validation failed',
    });
    return;
  }

  const { name, email, password } = parseResult.data;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('[auth] Registration error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: parseResult.error.issues[0]?.message || 'Validation failed',
    });
    return;
  }

  const { email, password } = parseResult.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('[auth] Login error:', err);
    res.status(500).json({ error: 'Failed to log in. Please try again.' });
  }
});

// POST /auth/logout
authRouter.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// GET /auth/me
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User account not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('[auth] Get me error:', err);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// GET /auth/ws-token - Issue short-lived ticket for WebSocket connection
authRouter.get('/ws-token', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'kagazai_development_secret_key_32_characters_minimum';
  const token = jwt.sign(
    {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      purpose: 'websocket',
    },
    secret,
    { expiresIn: '2h' }
  );

  res.status(200).json({ token });
});

