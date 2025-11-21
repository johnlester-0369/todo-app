/**
 * Type augmentation for Express Request
 * Extends the Request interface to include authenticated user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        [key: string]: unknown;
      };
    }
  }
}

export {};