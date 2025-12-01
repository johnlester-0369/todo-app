import { MongoClient, type Db } from 'mongodb';
import { logger } from '@/utils/logger.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI environment variable is required');
}

/**
 * If the MONGODB_URI contains the placeholder "<PASSWORD>" we require
 * MONGO_PASSWORD to be set and safely url-encode it before replacing.
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

const dbName = process.env.MONGODB_DB_NAME; // optional DB name

/**
 * Recommended connection options to make SDAM and timeout behaviour explicit.
 * These can be tuned per-environment.
 */
const clientOptions = {
  // How long to attempt server selection before giving up (ms)
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 30_000,
  // How long to wait for initial TCP connect (ms)
  connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 10_000,
  // How frequently the driver sends heartbeat checks (ms)
  heartbeatFrequencyMS: Number(process.env.MONGO_HEARTBEAT_FREQUENCY_MS) || 10_000,
  // Keep default pool/other options unless you have specific needs
} as const;

/**
 * Single MongoClient instance — keep same export name to match existing imports.
 */
export const mongoClient: MongoClient = new MongoClient(mongoDBURI, clientOptions);

// Exported DB reference (will point to mongoClient.db(dbName) — valid once client connects)
export let db: Db = mongoClient.db(dbName);

/**
 * Internal flags / retry policy configuration
 */
let isConnected = false;
let isConnecting = false;
let reconnectBackoffMs = 1000; // initial backoff
const RECONNECT_BACKOFF_MAX_MS = 30_000;
const INITIAL_CONNECT_MAX_ATTEMPTS = 5;

/**
 * Utility delay
 */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Setup listeners to detect client disconnects / driver monitoring events.
 * We use a small subset of events; more can be subscribed if desired.
 */
const setupEventListeners = () => {
  // Using `as any` because event names for monitoring can be specific and
  // typings vary across driver versions.
  const anyClient = mongoClient as any;

  anyClient.on?.('close', () => {
    isConnected = false;
    logger.warn('MongoClient emitted close — scheduling reconnect attempts');
    scheduleReconnect();
  });

  anyClient.on?.('error', (err: Error) => {
    // Log error; if not connected, schedule reconnect.
    logger.error('MongoClient error event', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    // If the client was disconnected, ensure a reconnect is scheduled.
    if (!isConnected) {
      scheduleReconnect();
    }
  });

  // Server monitoring / heartbeat events (informational)
  anyClient.on?.('serverHeartbeatFailed', (ev: unknown) => {
    logger.warn('MongoDB serverHeartbeatFailed event', { event: ev });
  });

  anyClient.on?.('serverHeartbeatSucceeded', (ev: unknown) => {
    logger.debug('MongoDB serverHeartbeatSucceeded event', { event: ev });
  });

  anyClient.on?.('serverClosed', (ev: unknown) => {
    logger.warn('MongoDB serverClosed event (a server became unavailable)', { event: ev });
  });

  anyClient.on?.('topologyClosed', () => {
    isConnected = false;
    logger.warn('MongoDB topologyClosed — scheduling reconnect attempts');
    scheduleReconnect();
  });
};

/**
 * Attempt to reconnect with exponential backoff until success.
 * This runs in the background (non-blocking).
 */
const scheduleReconnect = (): void => {
  // If already connecting, don't schedule another loop.
  if (isConnecting) return;

  (async () => {
    isConnecting = true;
    let backoff = reconnectBackoffMs;

    while (!isConnected) {
      try {
        logger.info('Attempting MongoDB reconnect (background attempt)', { backoffMs: backoff });
        await mongoClient.connect(); // driver will re-initialize topology/pools
        db = mongoClient.db(dbName);
        isConnected = true;
        isConnecting = false;
        reconnectBackoffMs = 1000; // reset for future disconnects
        logger.info('MongoDB reconnect successful');
        break;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.warn('MongoDB reconnect attempt failed', { error: msg, nextBackoffMs: backoff });
        // exponential backoff
        await delay(backoff);
        backoff = Math.min(RECONNECT_BACKOFF_MAX_MS, backoff * 2);
      }
    }
    isConnecting = false;
  })().catch((err) => {
    // This catch is just to prevent unhandled rejections from the background routine.
    logger.error('Unexpected error in scheduleReconnect', {
      error: err instanceof Error ? err.message : String(err),
    });
    isConnecting = false;
  });
};

/**
 * Connect to the database. On startup we attempt a bounded number of tries
 * before giving up (so server startup still fails fast if DB is down).
 *
 * If you prefer the server to wait indefinitely until DB returns, set
 * INITIAL_CONNECT_MAX_ATTEMPTS to Infinity or modify behaviour.
 */
export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    logger.debug('connectDatabase called but client already connected');
    return;
  }
  let attempt = 0;
  let backoff = reconnectBackoffMs;

  while (attempt < INITIAL_CONNECT_MAX_ATTEMPTS) {
    attempt += 1;
    try {
      logger.debug('Attempting initial MongoDB connection', { attempt });
      await mongoClient.connect();
      db = mongoClient.db(dbName);
      isConnected = true;
      logger.info('MongoDB connection established', {
        database: dbName || 'default',
        host: mongoClient.options?.hosts?.[0] ?? undefined,
      });

      // Wire up listeners after first successful connect
      try {
        setupEventListeners();
      } catch (evErr) {
        logger.warn('Failed to attach some MongoDB event listeners', {
          error: evErr instanceof Error ? evErr.message : String(evErr),
        });
      }

      return;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn('Initial MongoDB connection attempt failed', { attempt, error: msg });
      if (attempt >= INITIAL_CONNECT_MAX_ATTEMPTS) {
        logger.error('Exceeded initial MongoDB connection attempts; failing startup');
        throw error;
      }
      // wait then retry (exponential backoff)
      await delay(backoff);
      backoff = Math.min(RECONNECT_BACKOFF_MAX_MS, backoff * 2);
    }
  }
};

/**
 * Close DB connection (graceful shutdown). Safe to call multiple times.
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    logger.info('Closing MongoDB connection (closeDatabase called)');
    await mongoClient.close();
    isConnected = false;
    logger.info('MongoDB connection closed successfully');
  } catch (error) {
    logger.error('Error closing MongoDB connection', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/**
 * Helper to check if the client is currently connected.
 * Note: this is a best-effort check — the driver manages pools internally.
 */
export const isDatabaseConnected = (): boolean => isConnected;