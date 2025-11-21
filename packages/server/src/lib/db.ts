import { MongoClient, Db } from 'mongodb';
import { logger } from '@/utils/logger.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI environment variable is required');
}

/**
 * If the MONGODB_URI contains the placeholder "<PASSWORD>" we require
 * MONGO_PASSWORD to be set and safely url-encode it before replacing.
 *
 * This keeps behavior consistent with the original code while avoiding
 * accidental usage of literal "<PASSWORD>".
 */
let mongoDBURI = uri;
if (uri.includes('<PASSWORD>')) {
  const rawPassword = process.env.MONGO_PASSWORD;
  if (!rawPassword) {
    throw new Error(
      'MONGO_PASSWORD environment variable is required when MONGODB_URI contains the <PASSWORD> placeholder',
    );
  }
  const password = encodeURIComponent(rawPassword);
  mongoDBURI = uri.replace('<PASSWORD>', password);
}

const dbName = process.env.MONGODB_DB_NAME; // optional DB name (can be undefined)
export const mongoClient: MongoClient = new MongoClient(mongoDBURI);

// NOTE: calling client.db(name?) does not require the client to be connected first;
// the driver will lazily connect when an operation runs. This matches the example in the adapter docs.
export const db: Db = mongoClient.db(dbName);

/**
 * Eagerly connect the client at server startup.
 * The MongoDB driver's connect() method is idempotent and safe to call multiple times.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    logger.debug('Attempting to connect to MongoDB...', {
      database: dbName || 'default',
    });

    await mongoClient.connect();

    logger.info('MongoDB connection established', {
      database: dbName || 'default',
      host: mongoClient.options.hosts[0],
    });
  } catch (error) {
    logger.error('MongoDB connection failed', {
      error: error instanceof Error ? error.message : String(error),
      database: dbName || 'default',
    });
    throw error;
  }
};

/**
 * Close the underlying client connection.
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    logger.info('Closing MongoDB connection...');
    await mongoClient.close();
    logger.info('MongoDB connection closed successfully');
  } catch (error) {
    logger.error('Error closing MongoDB connection', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};