import type { ErrorRequestHandler } from 'express';
import { ValidationError } from './errors.js';
import { ERROR_CODES, ERRORS } from './constants.js';

/**
 * Everything worth keeping about a thrown value. The stack is the point: the
 * 500 response deliberately says nothing, so this line is the only record of
 * what actually failed.
 */
export const describeError = (err: unknown): string =>
  err instanceof Error ? (err.stack ?? err.message) : String(err);

/**
 * Central error middleware. Renders known ValidationErrors and body-parser
 * failures (malformed JSON, oversized payloads) with their real status; hides
 * anything unexpected behind a generic 500. Every route inherits this for free.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ valid: false, error: err.message, code: err.code });
    return;
  }

  // body-parser failures (malformed JSON, payload too large) carry a 4xx status.
  const status = (err as { status?: number }).status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    res
      .status(status)
      .json({ valid: false, error: ERRORS.INVALID_BODY, code: ERROR_CODES.BAD_REQUEST });
    return;
  }

  // Log the detail, return none: an unexpected failure must not leak internals.
  process.stderr.write(`Unhandled error: ${describeError(err)}\n`);
  res.status(500).json({ valid: false, error: ERRORS.INTERNAL, code: ERROR_CODES.INTERNAL });
};
