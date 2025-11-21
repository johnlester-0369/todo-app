import winston from 'winston';

/**
 * Determine log level based on environment.
 * - Production: 'info' level (info, warn, error)
 * - Development: 'debug' level (debug, info, warn, error)
 */
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

/**
 * Define log format based on environment.
 * - Production: JSON format for structured logging and parsing
 * - Development: Colorized, human-readable format with timestamps
 */
const format =
  process.env.NODE_ENV === 'production'
    ? winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      )
    : winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`,
        ),
      );

/**
 * Configure winston transports.
 * - Console: All logs (respects log level)
 * - File 'error.log': Only error-level logs
 * - File 'combined.log': All logs
 *
 * Files are only created in production to avoid clutter during development.
 */
const transports: winston.transport[] = [
  new winston.transports.Console(),
  ...(process.env.NODE_ENV === 'production'
    ? [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ]
    : []),
];

/**
 * Create and configure the winston logger instance.
 *
 * @example
 * ```typescript
 * import { logger } from '@/utils/logger.js';
 *
 * logger.info('Server started', { port: 3000 });
 * logger.error('Database connection failed', { error: err.message });
 * logger.debug('Debugging info', { data: someObject });
 * ```
 */
export const logger = winston.createLogger({
  level,
  format,
  transports,
  // Prevent winston from exiting on uncaught exceptions
  exitOnError: false,
});

/**
 * Stream interface for Morgan HTTP request logger integration.
 * Redirects Morgan's output to winston's info level.
 */
export const stream = {
  write: (message: string) => {
    // Remove trailing newline from Morgan output
    logger.info(message.trim());
  },
};

export default logger;