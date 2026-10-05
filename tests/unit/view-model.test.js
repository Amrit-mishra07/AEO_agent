import { describe, it, expect } from 'vitest';
import {
  extractDomain,
  normalizeKeywords,
  normalizeCompetitors,
  toAuditViewModel,
} from '@/view/audit-view-model';

describe('audit-view-model helper functions', () => {
  it('extracts clean domains accurately', () => {
    expect(extractDomain('https://www.example.com/blog')).toBe('example.com');
    expect(extractDomain('http://sub.company.org/path?q=1')).toBe('sub.company.org');
    expect(extractDomain('example.com')).toBe('example.com');
    expect(extractDomain('')).toBe('');
  });

  it('normalizes keywords from CSV strings and arrays', () => {
    expect(normalizeKeywords('a, b, c')).toEqual(['a', 'b', 'c']);
    expect(normalizeKeywords(['x', ' y '])).toEqual(['x', 'y']);
    expect(normalizeKeywords(null)).toEqual([]);
    expect(normalizeKeywords('')).toEqual([]);
  });

  it('normalizes competitors from varied formats (JSON, CSV, edge cases)', () => {
    expect(normalizeCompetitors('["stripe.com", "adyen.com"]')).toEqual(['stripe.com', 'adyen.com']);
    expect(normalizeCompetitors('stripe.com, adyen.com')).toEqual(['stripe.com', 'adyen.com']);
    expect(normalizeCompetitors('None detected')).toEqual([]);
    expect(normalizeCompetitors('N/A')).toEqual([]);
    expect(normalizeCompetitors(null)).toEqual([]);
    expect(normalizeCompetitors(['paypal.com'])).toEqual(['paypal.com']);
  });
});

describe('toAuditViewModel transformations', () => {
  it('handles null and empty input safely', () => {
    expect(toAuditViewModel(null)).toBe(null);
    expect(toAuditViewModel(undefined)).toBe(null);
  });

  it('resolves Q1 & Q2: treats unprobed visibility as null and ignores citation_score 0', () => {
    const rawAudit = {
      id: 'test-1',
      url: 'https://example.com',
      keywords: null,
      status: 'completed',
      overall_score: 85,
      technical_score: 85,
      visibility_score: null,
      citation_score: 0, // DB quirk Q1
      pages: [],
      seo_issues: [],
      schema_gaps: [],
      content_scores: [],
      citations: [],
    };

    const vm = toAuditViewModel(rawAudit);
    expect(vm.hasTestedVisibility).toBe(false);
    expect(vm.scores.visibility).toBe(null);
    expect(vm.scores.overall).toBe(85);
    expect(vm.scores.grade).toBe('B+');
    expect(vm.scores.verdict).toBe('Good');
  });

  it('resolves Q3 & Q4: separates title from fix suggestion and does not fabricate 200 status', () => {
    const rawAudit = {
      id: 'test-2',
      url: 'https://example.com',
      overall_score: 90,
      pages: [
        {
          id: 'p1',
          url: 'https://example.com',
          title: 'Example Domain',
          status_code: null, // crawler does not capture
          is_spa: 0,
        },
      ],
      seo_issues: [
        {
          id: 's1',
          type: 'metadata',
          severity: 'warning',
          message: 'Title Length',
          fix_suggestion: 'Keep title between 30 and 60 characters',
        },
      ],
    };

    const vm = toAuditViewModel(rawAudit);
    expect(vm.pages[0].status_code).toBeUndefined(); // no fabricated 200
    expect(vm.pages[0].title).toBe('Example Domain');
    expect(vm.seoIssues[0].issue).toBe('Title Length');
    expect(vm.seoIssues[0].fixSuggestion).toBe('Keep title between 30 and 60 characters');
  });

  it('resolves Q5: deduplicates meta fixes per page', () => {
    const metaFixArray = [
      { type: 'title', current: 'A', suggested: 'B', htmlSnippet: '<title>B</title>' },
    ];
    const rawAudit = {
      id: 'test-3',
      url: 'https://example.com',
      overall_score: 75,
      seo_issues: [
        {
          id: 's1',
          page_url: 'https://example.com',
          type: 'metadata',
          message: 'Title Length',
          generated_fix: JSON.stringify(metaFixArray),
        },
        {
          id: 's2',
          page_url: 'https://example.com',
          type: 'social',
          message: 'OpenGraph Missing',
          generated_fix: JSON.stringify(metaFixArray), // duplicate on same page
        },
      ],
    };

    const vm = toAuditViewModel(rawAudit);
    expect(vm.pageMetaFixes.length).toBe(1);
    expect(vm.pageMetaFixes[0].pageUrl).toBe('https://example.com');
  });

  it('resolves Q6: recognizes content scoring failure when rows are empty', () => {
    const rawAudit = {
      id: 'test-4',
      url: 'https://example.com',
      content_score: 50, // fallback default in route
      content_scores: [], // 0 rows scored
    };

    const vm = toAuditViewModel(rawAudit);
    expect(vm.isContentScored).toBe(false);
    expect(vm.scores.content).toBe(null); // suppressed fallback 50
  });

  it('resolves Q7: flags ungrounded probes and excludes from grounded counts', () => {
    const rawAudit = {
      id: 'test-5',
      url: 'https://example.com',
      keywords: 'q1, q2',
      visibility_score: 50,
      citations: [
        {
          target_query: 'q1',
          ai_engine: 'Gemini (Google Search Grounded)',
          citation_type: 'grounded_citation',
        },
        {
          target_query: 'q2',
          ai_engine: 'Gemini (Ungrounded Fallback)',
          citation_type: 'not_cited',
        },
      ],
    };

    const vm = toAuditViewModel(rawAudit);
    expect(vm.citations[0].isUngrounded).toBe(false);
    expect(vm.citations[1].isUngrounded).toBe(true);
    expect(vm.citationsSummary.groundedEligibleCount).toBe(1);
    expect(vm.citationsSummary.groundedCount).toBe(1);
  });

  it('resolves Q8: deserializes content_rewrite cleanly', () => {
    const rewriteObj = {
      rewrittenContent: '## New Intro\nClean answer here.',
      changes: ['Added clear direct answer'],
    };
    const rawAudit = {
      id: 'test-6',
      url: 'https://example.com',
      pages: [
        {
          id: 'p1',
          url: 'https://example.com/about',
          content_rewrite: JSON.stringify(rewriteObj),
        },
      ],
    };

    const vm = toAuditViewModel(rawAudit);
    expect(vm.contentRewrites.length).toBe(1);
    expect(vm.contentRewrites[0].rewrittenContent).toContain('Clean answer here');
    expect(vm.contentRewrites[0].changes[0]).toBe('Added clear direct answer');
  });

  it('computes historical score delta against past audits of same hostname', () => {
    const rawAudit = {
      id: 'curr-1',
      url: 'https://example.com',
      overall_score: 82,
    };
    const history = [
      {
        id: 'past-1',
        url: 'https://example.com/sub',
        status: 'completed',
        overall_score: 76,
        completed_at: '2026-09-01T00:00:00Z',
      },
    ];

    const vm = toAuditViewModel(rawAudit, history);
    expect(vm.scores.delta).toBe(6);
    expect(vm.scores.previousScore).toBe(76);
  });
});
