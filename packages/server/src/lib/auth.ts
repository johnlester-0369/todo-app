// auth.ts (TypeScript)
import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { db, mongoClient } from './db.js';

/** Parse trusted origins (unchanged) */
const parseTrustedOrigins = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined;
  const arr = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : undefined;
};

const trustedOrigins = parseTrustedOrigins(process.env.TRUSTED_ORIGINS);

// required envs
const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error('Environment variable BASE_URL is required for auth configuration.');
}

const authSecretUser = process.env.AUTH_SECRET_USER;
if (!authSecretUser) {
  throw new Error('Environment variable AUTH_SECRET_USER is required for auth configuration.');
}

// create plugin instances and cast to unify types at compile time
const plugins: BetterAuthPlugin[] = [
  // admin plugin (cast as a single BetterAuthPlugin to bypass cross-package type mismatch)
  admin({
    defaultRole: 'user',
    adminRoles: ['admin'],
  }) as unknown as BetterAuthPlugin,

  // expo plugin
  expo() as unknown as BetterAuthPlugin,
];

export const authUser = betterAuth({
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),

  baseURL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },

  ...(trustedOrigins ? { trustedOrigins } : {}),

  session: {
    // Session expiration: 7 days
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    
    // Update session expiry every 24 hours (if user is active)
    updateAge: 60 * 60 * 24, // 1 day in seconds
    
    // CRITICAL: Enable cookie caching for Expo session persistence
    // This allows the session data to be stored in encrypted cookies
    // that can be extracted by the Expo client and stored in SecureStore
    cookieCache: {
      enabled: true,
      // Cache session data for 7 days (matches session expiration)
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      // Encoding strategy: 'compact' is most efficient for mobile
      // Options: 'compact' (default, base64), 'jwt' (standard JWT), 'jwe' (encrypted)
      strategy: 'compact',
    },
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

  secret: authSecretUser,

  advanced: {
    cookiePrefix: 'user',
    // For development with Expo, disable secure cookies
    // In production, this will be automatically set to true
    useSecureCookies: process.env.NODE_ENV === 'production',
  },

  plugins,
});

export const auth = authUser;
export type AuthInstance = typeof auth;