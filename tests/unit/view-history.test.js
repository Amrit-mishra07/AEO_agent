import { describe, it, expect } from 'vitest';
import {
  normalizeHostname,
  groupAuditsByHost,
  calculateScoreDelta,
  getAuditTrendPoints,
} from '@/view/history';

describe('history view helpers', () => {
  it('normalizes hostnames defensively', () => {
    expect(normalizeHostname('https://WWW.Example.COM/path/to/page?q=test#hash')).toBe('example.com');
    expect(normalizeHostname('http://sub.domain.co.uk:8080/')).toBe('sub.domain.co.uk');
    expect(normalizeHostname('example.com')).toBe('example.com');
    expect(normalizeHostname('')).toBe('');
    expect(normalizeHostname(null)).toBe('');
  });

  it('groups audits by normalized hostname', () => {
    const audits = [
      { id: '1', url: 'https://example.com' },
      { id: '2', url: 'https://www.example.com/blog' },
      { id: '3', url: 'https://google.com' },
    ];
    const grouped = groupAuditsByHost(audits);
    expect(Object.keys(grouped)).toEqual(['example.com', 'google.com']);
    expect(grouped['example.com'].length).toBe(2);
    expect(grouped['google.com'].length).toBe(1);
  });

  it('calculates score delta against strictly prior audit of same host', () => {
    const historical = [
      {
        id: 'old-1',
        url: 'https://example.com',
        status: 'completed',
        overall_score: 70,
        completed_at: '2026-09-01T10:00:00Z',
      },
      {
        id: 'old-2',
        url: 'https://www.example.com/blog',
        status: 'completed',
        overall_score: 75,
        completed_at: '2026-09-15T10:00:00Z',
      },
      {
        id: 'future-run',
        url: 'https://example.com',
        status: 'completed',
        overall_score: 95,
        completed_at: '2026-10-10T10:00:00Z', // in future compared to current
      },
    ];

    const currentAudit = {
      id: 'current',
      url: 'https://example.com',
      status: 'completed',
      overall_score: 82,
      completed_at: '2026-10-01T10:00:00Z',
    };

    const result = calculateScoreDelta(currentAudit, historical);
    // Prior most recent is old-2 (score 75), current is 82 -> delta = +7
    expect(result.delta).toBe(7);
    expect(result.previousScore).toBe(75);
    expect(result.previousDate).toBe('2026-09-15T10:00:00Z');
  });

  it('returns null delta when no prior completed audits exist', () => {
    const currentAudit = {
      id: 'current',
      url: 'https://newdomain.com',
      overall_score: 80,
      completed_at: '2026-10-01T10:00:00Z',
    };
    const result = calculateScoreDelta(currentAudit, []);
    expect(result.delta).toBe(null);
    expect(result.previousScore).toBe(null);
  });

  it('extracts chronological trend points for sparklines', () => {
    const audits = [
      { url: 'https://example.com', status: 'completed', overall_score: 60, created_at: '2026-08-01' },
      { url: 'https://www.example.com', status: 'completed', overall_score: 72, created_at: '2026-09-01' },
      { url: 'https://example.com', status: 'completed', overall_score: 85, created_at: '2026-10-01' },
      { url: 'https://other.com', status: 'completed', overall_score: 50, created_at: '2026-09-01' },
    ];
    const trend = getAuditTrendPoints('example.com', audits);
    expect(trend).toEqual([60, 72, 85]);
  });
});
