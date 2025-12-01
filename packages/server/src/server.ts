import 'dotenv/config';
import app from '@/app.js';
import { connectDatabase, closeDatabase, isDatabaseConnected } from '@/lib/db.js';
import { taskRepo } from '@/repos/task.repo.js';
import { logger } from '@/utils/logger.js';

const PORT = process.env.PORT || 3000;

/**
 * Graceful shutdown handler for SIGTERM and SIGINT signals.
 * Ensures DB is closed cleanly before exiting.
 */
const gracefulShutdown = async (signal: string) => {
  try {
    logger.info(`${signal} signal received: closing HTTP server and database connections`);
    // Close DB (wait for it) — safe to call even if not connected
    await closeDatabase();
    logger.info('Shutdown complete, exiting process');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
  process.exit(1);
});

/**
 * Initialize and start the server.
 */
const startServer = async () => {
  try {
    // Connect to MongoDB (may throw if initial attempts fail)
    logger.info('Connecting to MongoDB...');
    await connectDatabase();
    logger.info('MongoDB connected successfully', {
      database: process.env.MONGODB_DB_NAME || 'default',
    });

    // Create database indexes for better performance
    logger.info('Creating database indexes...');
    await taskRepo.createIndexes();
    logger.info('Database indexes created successfully');

    // Start Express server
    app.listen(PORT, () => {
      logger.info('🚀 Server Started Successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

// Start the server
startServer();