import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { NextRequest } from 'next/server';
import { setDB, createAudit } from '@/lib/db';
import { GET as getHealth } from '@/app/api/health/route';
import { GET as getAuditRoute, POST as postAuditRoute } from '@/app/api/audit/route';
import * as crawler from '@/lib/crawler';

describe('Layer 4: API & Security Controls (E2E Contracts)', () => {
  let memDb;

  beforeEach(() => {
    memDb = new Database(':memory:');
    setDB(memDb);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/health', () => {
    it('returns 200 healthy when SQLite alive and GEMINI_API_KEY is present', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      const res = await getHealth();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe('healthy');
      expect(body.services.database.status).toBe('healthy');
      expect(body.services.gemini_ai.configured).toBe(true);
      expect(body.services.gemini_ai.model).toBeDefined();
    });

    it('returns 503 degraded when GEMINI_API_KEY is missing', async () => {
      const origKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const res = await getHealth();
      const body = await res.json();

      expect(res.status).toBe(503);
      expect(body.status).toBe('degraded');
      expect(body.services.gemini_ai.configured).toBe(false);

      process.env.GEMINI_API_KEY = origKey;
    });

    it('returns 503 when database throws', async () => {
      // Mock db prepare to throw
      const brokenDb = {
        exec: () => {},
        pragma: () => [],
        prepare: () => {
          throw new Error('Database locked');
        }
      };
      setDB(brokenDb);

      const res = await getHealth();
      const body = await res.json();

      expect(res.status).toBe(503);
      expect(body.services.database.status).toContain('unhealthy');
    });
  });

  describe('GET /api/audit', () => {
    it('returns audit list when no id parameter is passed', async () => {
      createAudit('https://example.com/site-a', ['query a']);
      createAudit('https://example.com/site-b', ['query b']);

      const req = new NextRequest('http://localhost:3000/api/audit');
      const res = await getAuditRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
      expect(data[0].url).toContain('https://example.com');
    });

    it('returns 404 when audit ID does not exist', async () => {
      const req = new NextRequest('http://localhost:3000/api/audit?id=non-existent-uuid');
      const res = await getAuditRoute(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe('Not found');
    });

    it('returns audit details when valid id is queried', async () => {
      const audit = createAudit('https://example.com', ['test query']);
      const req = new NextRequest(`http://localhost:3000/api/audit?id=${audit.id}`);
      const res = await getAuditRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(audit.id);
      expect(data.url).toBe('https://example.com');
      expect(data.status).toBe('pending');
    });
  });

  describe('POST /api/audit — Auth, Validation & SSRF', () => {
    it('enforces optional API key authentication when AEO_API_KEY is configured', async () => {
      process.env.AEO_API_KEY = 'secret-aeo-token';

      // 1. Without auth header -> 401
      const unauthReq = new NextRequest('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.99' },
        body: JSON.stringify({ url: 'https://example.com' })
      });
      const unauthRes = await postAuditRoute(unauthReq);
      expect(unauthRes.status).toBe(401);

      // 2. With wrong auth header -> 401
      const wrongReq = new NextRequest('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.99',
          'authorization': 'Bearer wrong-token'
        },
        body: JSON.stringify({ url: 'https://example.com' })
      });
      const wrongRes = await postAuditRoute(wrongReq);
      expect(wrongRes.status).toBe(401);

      delete process.env.AEO_API_KEY;
    });

    it('returns 400 when url is missing from body', async () => {
      const req = new NextRequest('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.10' },
        body: JSON.stringify({})
      });
      const res = await postAuditRoute(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('URL is required');
    });

    it('blocks SSRF attempts on private and loopback destinations with 400', async () => {
      const forbiddenTargets = [
        'http://127.0.0.1:8080',
        'http://localhost:3000',
        'http://169.254.169.254/latest/meta-data',
        'http://[::1]',
        'file:///etc/passwd'
      ];

      for (let i = 0; i < forbiddenTargets.length; i++) {
        const target = forbiddenTargets[i];
        const req = new NextRequest('http://localhost:3000/api/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Use distinct IP for each request to not trip rate limit
            'x-forwarded-for': `198.51.101.${i + 1}`
          },
          body: JSON.stringify({ url: target })
        });

        const res = await postAuditRoute(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain('Disallowed URL');
      }
    });
  });

  describe('POST /api/audit — Rate Limiting & Concurrency Control', () => {
    it('enforces 5 requests per 10 minutes per IP address (429 on 6th request)', async () => {
      const fixedIp = '203.0.113.42';

      // 5 requests with missing url (which counts towards rate limit before body validation)
      for (let i = 0; i < 5; i++) {
        const req = new NextRequest('http://localhost:3000/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-forwarded-for': fixedIp },
          body: JSON.stringify({})
        });
        const res = await postAuditRoute(req);
        expect(res.status).toBe(400); // Reaches URL validation
      }

      // 6th request from same IP
      const req6 = new NextRequest('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': fixedIp },
        body: JSON.stringify({ url: 'https://example.com' })
      });
      const res6 = await postAuditRoute(req6);
      const data6 = await res6.json();

      expect(res6.status).toBe(429);
      expect(data6.error).toContain('Rate limit exceeded');
    });

    it('enforces maximum 2 concurrent running audits (429 on 3rd simultaneous run)', async () => {
      vi.spyOn(crawler, 'validateSafeUrl').mockResolvedValue({ valid: true, hostname: 'example.com' });

      // Mock crawlSite to stay pending until we release it
      let releaseAudit1, releaseAudit2;
      const p1 = new Promise((resolve) => { releaseAudit1 = resolve; });
      const p2 = new Promise((resolve) => { releaseAudit2 = resolve; });

      let callCount = 0;
      vi.spyOn(crawler, 'crawlSite').mockImplementation(() => {
        callCount++;
        return callCount === 1 ? p1 : p2;
      });

      // Launch Audit 1 from unique IP
      const req1 = new NextRequest('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.0.2.1' },
        body: JSON.stringify({ url: 'https://example-concurrent-1.com' })
      });
      const res1 = await postAuditRoute(req1);
      expect(res1.status).toBe(201);

      // Launch Audit 2 from unique IP
      const req2 = new NextRequest('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.0.2.2' },
        body: JSON.stringify({ url: 'https://example-concurrent-2.com' })
      });
      const res2 = await postAuditRoute(req2);
      expect(res2.status).toBe(201);

      // Launch Audit 3 from unique IP -> should hit 429 concurrency limit
      const req3 = new NextRequest('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.0.2.3' },
        body: JSON.stringify({ url: 'https://example-concurrent-3.com' })
      });
      const res3 = await postAuditRoute(req3);
      const data3 = await res3.json();

      expect(res3.status).toBe(429);
      expect(data3.error).toContain('Server capacity reached');

      // Release background audits
      releaseAudit1([]);
      releaseAudit2([]);
    });
  });
});
