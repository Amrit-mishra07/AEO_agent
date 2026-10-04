import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { setDB } from '@/lib/db';
import { GET } from '@/app/api/health/route';

describe('/api/health endpoint', () => {
  beforeEach(() => {
    const memDb = new Database(':memory:');
    setDB(memDb);
  });

  it('returns healthy status when database is reachable', async () => {
    process.env.GEMINI_API_KEY = 'test_key';
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.services.database.status).toBe('healthy');
    expect(data.services.gemini_ai.configured).toBe(true);
  });

  it('reports degraded status when GEMINI_API_KEY is missing', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('degraded');
    expect(data.services.gemini_ai.configured).toBe(false);

    process.env.GEMINI_API_KEY = originalKey;
  });
});
