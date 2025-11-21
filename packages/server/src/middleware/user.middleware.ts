import type { Request, Response, NextFunction } from 'express';
import { authUser } from '@/lib/auth.js';

/**
 * User Authentication Middleware
 * Verifies user session and attaches user info to request
 *
 * Note: Request type extension is defined in src/types/express.d.ts
 */
export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get session from Better Auth (cookies are automatically parsed)
    const session = await authUser.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session || !session.user) {
      res.status(401).json({ error: 'Unauthorized. Please login.' });
      return;
    }

    // Attach user info to request for use in controllers
    req.user = session.user;

    next();
  } catch (error) {
    console.error('User auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};