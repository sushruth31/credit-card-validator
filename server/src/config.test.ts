import { describe, it, expect, afterEach, vi } from 'vitest';

/** Re-imports config with the current environment, since it is read at import time. */
const loadConfig = async () => {
  vi.resetModules();
  return (await import('./config.js')).config;
};

afterEach(() => vi.unstubAllEnvs());

describe('config', () => {
  it('falls back to development defaults when nothing is set', async () => {
    vi.stubEnv('PORT', '');
    vi.stubEnv('CORS_ORIGIN', '');
    vi.stubEnv('NODE_ENV', 'development');
    await expect(loadConfig()).resolves.toEqual({
      port: 3001,
      cors: { origin: 'http://localhost:5173' },
    });
  });

  it('reads the port and origin from the environment', async () => {
    vi.stubEnv('PORT', '8080');
    vi.stubEnv('CORS_ORIGIN', 'https://cards.example.com');
    const config = await loadConfig();
    expect(config.port).toBe(8080);
    expect(config.cors.origin).toBe('https://cards.example.com');
  });

  it('fails at startup on a port that is not a usable integer', async () => {
    for (const port of ['abc', '0', '70000', '3001.5']) {
      vi.stubEnv('PORT', port);
      await expect(loadConfig()).rejects.toThrow(/PORT must be an integer/);
    }
  });

  it('refuses to start in production without an explicit CORS origin', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CORS_ORIGIN', '');
    await expect(loadConfig()).rejects.toThrow(/CORS_ORIGIN is required/);
  });
});
