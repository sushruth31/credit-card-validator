const DEV_API_URL = 'http://localhost:3001/api';

/**
 * Vite inlines VITE_* at build time, so an unset value cannot be recovered at
 * runtime. A production bundle silently pointing at localhost would look like
 * a network outage to every user, so it throws on load instead.
 */
const readApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url;
  if (import.meta.env.PROD) {
    throw new Error('VITE_API_URL must be set when building the client. See .env.example.');
  }
  return DEV_API_URL;
};

/** API client configuration. */
export const API_CONFIG = {
  BASE_URL: readApiBaseUrl(),
  TIMEOUT: 5000,
  CONTENT_TYPE: 'application/json',
} as const;

/** Endpoints called by the client. */
export const ENDPOINTS = {
  VALIDATE: '/validate',
} as const;

/** UI configuration. */
export const UI = {
  DEBOUNCE_MS: 400,
  MAX_CARD_DIGITS: 19,
  DIGIT_GROUP_SIZE: 4,
} as const;

/**
 * Fallback for requests that never complete (network down, timeout). When the
 * API does respond — even with a 4xx/5xx — its envelope supplies the message.
 */
export const MESSAGES = {
  UNAVAILABLE: 'Could not reach the validation service.',
} as const;
