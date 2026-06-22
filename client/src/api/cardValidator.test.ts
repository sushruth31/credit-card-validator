import { describe, it, expect } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { toVerdict } from './cardValidator';
import { MESSAGES } from '../constants';

const rejectionWith = (data: unknown) =>
  new AxiosError('Bad Request', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 400,
    data,
  } as AxiosResponse);

describe('toVerdict', () => {
  it("keeps the API's own reason when the response carries an error envelope", () => {
    const envelope = { valid: false, error: 'Invalid request body.' };
    expect(toVerdict(rejectionWith(envelope))).toEqual(envelope);
  });

  it('falls back when the request never completed or the body is not an envelope', () => {
    const fallback = { valid: false, error: MESSAGES.UNAVAILABLE };
    expect(toVerdict(new Error('network down'))).toEqual(fallback);
    expect(toVerdict(rejectionWith('<html>502 Bad Gateway</html>'))).toEqual(fallback);
  });
});
