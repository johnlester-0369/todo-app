import { betterAuth } from 'better-auth';
import { admin as adminPlugin } from 'better-auth/plugins';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { db, mongoClient } from './db.js';

/**
 * Parse trusted origins from environment variable.
 *
 * The better-auth option expects:
 *   trustedOrigins?: string[] | ((request: Request) => string[] | Promise<string[]>)
 *
 * process.env.TRUSTED_ORIGINS is `string | undefined`. Convert it to
 * `string[] | undefined` by splitting on commas and trimming entries.
 *
 * Examples for TRUSTED_ORIGINS:
 *  - "https://example.com"
 *  - "https://site1.com, https://site2.com"
 */
const parseTrustedOrigins = (
  value: string | undefined,
): string[] | undefined => {
  if (!value) return undefined;
  const arr = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : undefined;
};

const trustedOrigins = parseTrustedOrigins(process.env.TRUSTED_ORIGINS);

// Ensure required environment variables exist and narrow their types to `string` for TS
const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error(
    'Environment variable BASE_URL is required for auth configuration.',
  );
}

const authSecretUser = process.env.AUTH_SECRET_USER;
if (!authSecretUser) {
  throw new Error(
    'Environment variable AUTH_SECRET_USER is required for auth configuration.',
  );
}

// ----------------------------
// USER auth instance
// ----------------------------
export const authUser = betterAuth({
  // Pass the MongoDB `db` and the `client` (client is optional but required for transactions).
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),

  // baseURL is guaranteed to be a string because of the runtime check above
  baseURL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },

  // Only include `trustedOrigins` when it's actually defined (never pass `undefined`).
  // This avoids the TypeScript error under `exactOptionalPropertyTypes`.
  ...(trustedOrigins ? { trustedOrigins } : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  rateLimit: {
    enabled: true,
    storage: 'database' as const,
    customRules: {
      '/sign-in/email': { window: 10, max: 3 },
      '/sign-up/email': { window: 60, max: 5 },
    },
  },
  basePath: '/api/v1/user/auth',
  // secret is guaranteed to be a string because of the runtime check above
  secret: authSecretUser,
  advanced: {
    cookiePrefix: 'user',
  },
  plugins: [
    adminPlugin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],
});

export const auth = authUser; // for schema/cli compatibility if needed
export type AuthInstance = typeof auth;
