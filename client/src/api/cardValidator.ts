import axios, { AxiosError } from 'axios';
import { API_CONFIG, ENDPOINTS, MESSAGES } from '../constants';
import type { ValidationResponse } from '@ccv/shared';

const http = axios.create({ baseURL: API_CONFIG.BASE_URL, timeout: API_CONFIG.TIMEOUT });

/**
 * A 4xx/5xx means the request completed and the API answered with its own
 * error envelope, so that reason is the honest thing to show. Anything without
 * a usable response — network down, timeout — gets the generic fallback.
 */
export const toVerdict = (error: unknown): ValidationResponse => {
  const body =
    error instanceof AxiosError
      ? (error.response?.data as ValidationResponse | undefined)
      : undefined;
  return typeof body?.error === 'string' ? body : { valid: false, error: MESSAGES.UNAVAILABLE };
};

/**
 * Validates a card number against the API. Never rejects: a failure resolves to
 * an invalid verdict, so callers deal with one shape instead of two paths.
 */
export const validateCard = (cardNumber: string): Promise<ValidationResponse> =>
  http
    .post<ValidationResponse>(ENDPOINTS.VALIDATE, { cardNumber })
    .then((response) => response.data)
    .catch(toVerdict);
