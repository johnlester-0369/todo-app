import express, { type Request, type Response, type NextFunction } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { logger } from '@/utils/logger.js';
import { authUser } from '@/lib/auth.js';
import { toNodeHandler } from 'better-auth/node';
import taskRoutes from '@/routes/v1/task.routes.js';

const app = express();


/**
 * Request logging middleware.
 * Logs HTTP method, URL, status code, and response time for each request.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request details
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, 'Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});


// === Security Middleware ===
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(","),
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// === Compression (safe to apply early) ===
app.use(compression());

// === Mount Better-Auth handlers BEFORE body-parsers ===
app.all('/api/v1/user/auth/*', toNodeHandler(authUser));

// Now add express.json and urlencoded for your other routes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// === API Routes ===
app.use('/api/v1/user/tasks', taskRoutes);

app.get('/', (_req: Request, res: Response) => {
  logger.debug('Root endpoint accessed');
  res.send('Welcome to express');
});

/**
 * Global error handler.
 * Catches and logs all unhandled errors in route handlers.
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error in request', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

export default app;