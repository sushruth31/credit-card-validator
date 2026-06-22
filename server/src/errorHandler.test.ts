import { describe, it, expect } from 'vitest';
import { describeError } from './errorHandler.js';

describe('describeError', () => {
  it('keeps the stack — the 500 body says nothing, so the log is the only record', () => {
    const described = describeError(new Error('connection refused'));
    expect(described).toContain('connection refused');
    // A stack frame, not just "Error: connection refused".
    expect(described).toMatch(/\n\s+at /);
  });

  it('falls back to the value itself when something other than an Error is thrown', () => {
    expect(describeError('a bare string')).toBe('a bare string');
    expect(describeError({ code: 'ECONNRESET' })).toBe('[object Object]');
  });
});
