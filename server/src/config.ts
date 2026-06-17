const DEFAULT_PORT = 3001;
const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';
const MAX_PORT = 65535;

const isProduction = (): boolean => process.env.NODE_ENV === 'production';

const readPort = (): number => {
  const raw = process.env.PORT;
  if (raw === undefined || raw === '') return DEFAULT_PORT;

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) {
    throw new Error(`PORT must be an integer between 1 and ${MAX_PORT}, received "${raw}".`);
  }
  return port;
};

const readCorsOrigin = (): string => {
  const origin = process.env.CORS_ORIGIN;
  if (origin) return origin;
  if (isProduction()) {
    throw new Error('CORS_ORIGIN is required when NODE_ENV=production. See .env.example.');
  }
  return DEFAULT_CORS_ORIGIN;
};

/**
 * Configuration, read from the environment once at import time so a bad value
 * crashes the process at startup rather than on the first request.
 *
 * The defaults exist for local development only. CORS_ORIGIN is deliberately
 * not defaulted in production: falling back to a localhost origin there would
 * fail silently in the browser, and falling back to `*` would be worse.
 */
export const config = {
  port: readPort(),
  cors: { origin: readCorsOrigin() },
} as const;
