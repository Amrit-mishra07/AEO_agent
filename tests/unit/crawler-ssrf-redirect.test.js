import { describe, it, expect, vi } from 'vitest';
import { isPrivateIP, safeFetch, validateSafeUrl } from '@/lib/crawler';

describe('Crawler SSRF Hardening & Redirect Protection', () => {
  it('correctly catches complex IPv4-mapped IPv6 and bracketed notations', () => {
    expect(isPrivateIP('[127.0.0.1]')).toBe(true);
    expect(isPrivateIP('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateIP('::ffff:10.0.0.1')).toBe(true);
    expect(isPrivateIP('::ffff:169.254.169.254')).toBe(true);
    expect(isPrivateIP('::ffff:7f00:1')).toBe(true); // 127.0.0.1 in hex
    expect(isPrivateIP('::ffff:a00:1')).toBe(true);  // 10.0.0.1 in hex
    expect(isPrivateIP('2001:db8::1')).toBe(true);   // Documentation IPv6
    expect(isPrivateIP('192.0.2.1')).toBe(true);     // Documentation IPv4
  });

  it('allows valid public IPs', () => {
    expect(isPrivateIP('8.8.8.8')).toBe(false);
    expect(isPrivateIP('1.1.1.1')).toBe(false);
    expect(isPrivateIP('::ffff:8.8.8.8')).toBe(false);
  });

  it('prevents redirect hopping from public to private IP during safeFetch', async () => {
    // Mock global fetch to simulate a 302 redirect hopping to 169.254.169.254
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url === 'https://example.com/redirect-to-metadata') {
        return new Response(null, {
          status: 302,
          headers: {
            Location: 'http://169.254.169.254/latest/meta-data'
          }
        });
      }
      return new Response('ok', { status: 200 });
    });

    try {
      await expect(
        safeFetch('https://example.com/redirect-to-metadata')
      ).rejects.toThrow(/SSRF Blocked/);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('enforces maximum redirect hop limit', async () => {
    const originalFetch = global.fetch;
    let hopCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      hopCount++;
      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://example.com/hop-${hopCount}`
        }
      });
    });

    try {
      await expect(
        safeFetch('https://example.com/hop-0', { maxRedirects: 3 })
      ).rejects.toThrow(/Too many redirects/);
    } finally {
      global.fetch = originalFetch;
    }
  }, 30000);
});
