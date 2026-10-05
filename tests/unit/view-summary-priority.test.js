import { describe, it, expect } from 'vitest';
import { extractPriorityFixes } from '@/view/priority';
import { generateExecutiveSummary, generatePlainTextSummary } from '@/view/summary';

describe('Priority Fixes Ranker', () => {
  it('returns empty array when audit is null', () => {
    expect(extractPriorityFixes(null)).toEqual([]);
  });

  it('ranks critical SEO issues ahead of warnings and low priority items', () => {
    const mockAudit = {
      seoIssues: [
        { severity: 'warning', issue: 'Missing meta description' },
        { severity: 'critical', issue: 'Missing canonical tag' },
      ],
      schemaGaps: [
        { status: 'critical', schemaType: 'Organization' },
      ],
      contentScores: [],
      citations: [],
    };

    const fixes = extractPriorityFixes(mockAudit);
    expect(fixes.length).toBe(3);
    expect(fixes[0].title).toBe('Missing canonical tag'); // Critical SEO (100)
    expect(fixes[1].title).toBe('Missing Organization structured data'); // Critical Schema (90)
    expect(fixes[2].title).toBe('Missing meta description'); // Warning SEO (60)
  });

  it('limits priority fixes to at most 5 items', () => {
    const mockAudit = {
      seoIssues: Array.from({ length: 8 }, (_, i) => ({
        severity: 'critical',
        issue: `Critical Issue ${i + 1}`,
      })),
      schemaGaps: [],
      contentScores: [],
      citations: [],
    };

    const fixes = extractPriorityFixes(mockAudit);
    expect(fixes.length).toBe(5);
    expect(fixes[0].rank).toBe(1);
    expect(fixes[4].rank).toBe(5);
  });
});

describe('Executive Summary Generator', () => {
  it('generates optimal verdict for high scores', () => {
    const audit = {
      overallScore: 85,
      grade: 'A',
      domain: 'example.com',
      seoScore: 90,
      schemaScore: 80,
      contentScore: 85,
      citationScore: 75,
      seoIssues: [],
      schemaGaps: [],
      citations: [
        { status: 'cited', keyword: 'fast database' },
        { status: 'not_cited', keyword: 'sql api' },
      ],
    };

    const summary = generateExecutiveSummary(audit);
    expect(summary.headline).toBe('Optimal for AI Ingestion');
    expect(summary.grade).toBe('A');
    expect(summary.probedCount).toBe(2);
    expect(summary.keyHighlights.some(h => h.includes('Gemini cited'))).toBe(true);
  });

  it('generates deficits verdict for low scores', () => {
    const audit = {
      overallScore: 42,
      grade: 'F',
      domain: 'broken.example',
      seoIssues: [{ severity: 'critical', message: 'Broken crawl' }],
      schemaGaps: [{ status: 'critical', schemaType: 'Article' }],
      citations: [],
    };

    const summary = generateExecutiveSummary(audit);
    expect(summary.headline).toBe('Critical Synthesis Deficits');
    expect(summary.citationDisclaimer).toContain('No citation probe was run');
  });

  it('generates clean plain-text summary with action items', () => {
    const audit = {
      overallScore: 72,
      grade: 'C',
      domain: 'northwind.example',
      seoScore: 80,
      schemaScore: 65,
      contentScore: 70,
      citationScore: 50,
      seoIssues: [{ severity: 'critical', issue: 'Missing title tag' }],
      schemaGaps: [{ status: 'critical', schemaType: 'FAQPage' }],
      citations: [{ status: 'cited', keyword: 'best analytics' }],
    };

    const text = generatePlainTextSummary(audit, 'https://aeo.local/audit/123');
    expect(text).toContain('AEO Diagnostic Summary — northwind.example');
    expect(text).toContain('Overall Score: 72/100 (Grade C)');
    expect(text).toContain('Top Action Items:');
    expect(text).toContain('Missing title tag');
    expect(text).toContain('Full Report: https://aeo.local/audit/123');
    expect(text).toContain('Probed with Gemini 2.5');
  });
});
