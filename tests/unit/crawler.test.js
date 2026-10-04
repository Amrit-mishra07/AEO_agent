import { describe, it, expect } from 'vitest';
import { isPrivateIP, validateSafeUrl, detectSpaFramework } from '@/lib/crawler';
import * as cheerio from 'cheerio';

describe('Crawler SSRF & Safety Checks', () => {
  it('correctly identifies private and loopback IPv4 addresses', () => {
    expect(isPrivateIP('127.0.0.1')).toBe(true);
    expect(isPrivateIP('127.0.0.5')).toBe(true);
    expect(isPrivateIP('10.0.0.1')).toBe(true);
    expect(isPrivateIP('172.16.0.1')).toBe(true);
    expect(isPrivateIP('172.31.255.255')).toBe(true);
    expect(isPrivateIP('192.168.1.1')).toBe(true);
    expect(isPrivateIP('169.254.169.254')).toBe(true); // AWS/cloud metadata
    expect(isPrivateIP('0.0.0.0')).toBe(true);
    expect(isPrivateIP('100.64.0.1')).toBe(true);
  });

  it('correctly identifies public IPv4 addresses as non-private', () => {
    expect(isPrivateIP('8.8.8.8')).toBe(false);
    expect(isPrivateIP('1.1.1.1')).toBe(false);
    expect(isPrivateIP('142.250.190.46')).toBe(false);
    expect(isPrivateIP('172.32.0.1')).toBe(false); // Outside 172.16-31
  });

  it('correctly identifies IPv6 loopback and private ranges', () => {
    expect(isPrivateIP('::1')).toBe(true);
    expect(isPrivateIP('fe80::1')).toBe(true);
    expect(isPrivateIP('fc00::1')).toBe(true);
    expect(isPrivateIP('fd12:3456:789a::1')).toBe(true);
  });

  it('blocks disallowed protocols and credentials in validateSafeUrl', async () => {
    const fileRes = await validateSafeUrl('file:///etc/passwd');
    expect(fileRes.valid).toBe(false);
    expect(fileRes.reason).toMatch(/Disallowed protocol/);

    const credRes = await validateSafeUrl('https://admin:secret@google.com');
    expect(credRes.valid).toBe(false);
    expect(credRes.reason).toMatch(/embedded credentials/);
  });

  it('blocks localhost and private IPs in validateSafeUrl', async () => {
    const localhostRes = await validateSafeUrl('http://localhost:3000');
    expect(localhostRes.valid).toBe(false);
    expect(localhostRes.reason).toMatch(/Blocked internal hostname/);

    const ipRes = await validateSafeUrl('http://169.254.169.254/latest/meta-data');
    expect(ipRes.valid).toBe(false);
    expect(ipRes.reason).toMatch(/private or loopback IP/);
  });

  it('detects SPA / Client-Side Rendered shells with minimal content', () => {
    const spaHtml = '<html><body><div id="root"></div><script src="/bundle.js"></script></body></html>';
    const $ = cheerio.load(spaHtml);
    const analysis = detectSpaFramework($, 5);
    expect(analysis.isSpa).toBe(true);
    expect(analysis.warning).toMatch(/Client-side rendered SPA/);

    const normalHtml = '<html><body><h1>Full Article</h1><p>' + 'word '.repeat(200) + '</p></body></html>';
    const $normal = cheerio.load(normalHtml);
    const normalAnalysis = detectSpaFramework($normal, 201);
    expect(normalAnalysis.isSpa).toBe(false);
  });
});
