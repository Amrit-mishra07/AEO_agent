import { describe, it, expect } from 'vitest';
import { toAuditViewModel } from '@/view/audit-view-model';
import { extractPriorityFixes } from '@/view/priority';

describe('End-to-End View Integration with Raw Database Shapes', () => {
  // Simulates the exact structure returned by getAudit(id) from SQLite
  const rawDbAudit = {
    id: 'audit-test-123',
    url: 'https://acme-analytics.io',
    status: 'completed',
    current_stage: 'completed',
    created_at: '2026-10-06T10:00:00Z',
    completed_at: '2026-10-06T10:05:00Z',
    keywords: 'open source analytics, product analytics',
    overall_score: 68,
    seo_score: 75,
    schema_score: 60,
    content_score: 55,
    citation_score: 40,
    technical_score: 70,
    visibility_score: 40,
    llms_txt: '# Acme Analytics\n\n> Modern analytics platform.',
    pages: [
      {
        id: 'p-1',
        audit_id: 'audit-test-123',
        url: 'https://acme-analytics.io',
        title: 'Acme - Modern Product Analytics',
        status_code: 200,
        type: 'Homepage',
        is_spa: 0,
        spa_warning: null,
        content_rewrite: JSON.stringify({
          pageUrl: 'https://acme-analytics.io',
          rewrittenContent: '# Acme Analytics\nAcme Analytics is an open-source analytics platform...',
          originalExcerpt: 'We do lots of nice things for developers.'
        }),
      },
      {
        id: 'p-2',
        audit_id: 'audit-test-123',
        url: 'https://acme-analytics.io/pricing',
        title: 'Pricing - Acme',
        status_code: 200,
        type: 'Product',
        is_spa: 1,
        spa_warning: 'Heavy client-side JavaScript rendering detected.',
        content_rewrite: null,
      }
    ],
    seo_issues: [
      {
        id: 'seo-1',
        audit_id: 'audit-test-123',
        type: 'meta',
        severity: 'critical',
        message: 'Missing canonical tag on homepage',
        page_url: 'https://acme-analytics.io',
        fix_suggestion: 'Add <link rel="canonical" href="https://acme-analytics.io" />',
        generated_fix: '<link rel="canonical" href="https://acme-analytics.io" />',
      }
    ],
    schema_gaps: [
      {
        id: 'schema-1',
        audit_id: 'audit-test-123',
        type: 'Organization',
        importance: 'required',
        message: 'Page appears to be a Homepage but is missing Organization schema.',
        expected: 1,
        actual: 0,
        page_url: 'https://acme-analytics.io',
        generated_fix: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Acme Analytics',
          url: 'https://acme-analytics.io',
        }, null, 2),
      }
    ],
    content_scores: [
      {
        id: 'cs-1',
        audit_id: 'audit-test-123',
        page_url: 'https://acme-analytics.io',
        overall_page_score: 52,
        first_sentence_answerability: 45,
        definition_clarity: 50,
        fact_specificity: 55,
        scannable_structure: 60,
        faq_presence: 40,
        citation_readiness: 60,
        feedback: JSON.stringify({ answerability: 'Needs clearer initial definition.' }),
        suggested_improvements: JSON.stringify([
          'State what Acme does in the very first sentence.'
        ]),
      }
    ],
    citations: [
      {
        id: 'cit-1',
        audit_id: 'audit-test-123',
        target_query: 'open source analytics',
        source_url: 'https://acme-analytics.io',
        snippet: 'Acme Analytics is an open source platform.',
        ai_engine: 'Gemini (Google Search Grounded)',
        citation_type: 'grounded_citation',
        sentiment: 'recommended',
        competitors: JSON.stringify(['posthog.com', 'matomo.org']),
      },
      {
        id: 'cit-2',
        audit_id: 'audit-test-123',
        target_query: 'product analytics tools',
        source_url: null,
        snippet: null,
        ai_engine: 'Gemini (Ungrounded Fallback)',
        citation_type: 'not_cited',
        sentiment: 'neutral',
        competitors: 'mixpanel.com, amplitude.com',
      }
    ]
  };

  it('transforms raw DB audit into UI view model with accurate fields', () => {
    const vm = toAuditViewModel(rawDbAudit);

    expect(vm).toBeDefined();
    expect(vm.domain).toBe('acme-analytics.io');
    expect(vm.overallScore).toBe(68);
    expect(vm.visibilityScore).toBe(40);
    expect(vm.citationScore).toBe(40);

    // Pages checks
    expect(vm.pages.length).toBe(2);
    expect(vm.pages[0].statusCode).toBe(200);
    expect(vm.pages[0].isSpa).toBe(false);
    expect(vm.pages[1].statusCode).toBe(200);
    expect(vm.pages[1].isSpa).toBe(true);

    // Citations checks: preserves query, engine, competitors, and ungrounded flag
    expect(vm.citations.length).toBe(2);
    expect(vm.citations[0].query).toBe('open source analytics');
    expect(vm.citations[0].engine).toBe('Gemini (Google Search Grounded)');
    expect(vm.citations[0].isUngrounded).toBe(false);
    expect(vm.citations[0].competitors).toEqual(['posthog.com', 'matomo.org']);

    expect(vm.citations[1].query).toBe('product analytics tools');
    expect(vm.citations[1].engine).toBe('Gemini (Ungrounded Fallback)');
    expect(vm.citations[1].isUngrounded).toBe(true);
    expect(vm.citations[1].competitors).toEqual(['mixpanel.com', 'amplitude.com']);

    // Schema gaps checks
    expect(vm.schemaGaps.length).toBe(1);
    expect(vm.schemaGaps[0].schemaType).toBe('Organization');
    expect(vm.schemaGaps[0].status).toBe('required');
    expect(vm.schemaGaps[0].isValidJson).toBe(true);

    // Content rewrites checks
    expect(vm.contentRewrites.length).toBe(1);
    expect(vm.contentRewrites[0].pageUrl).toBe('https://acme-analytics.io');
    expect(vm.contentRewrites[0].rewrittenContent).toContain('Acme Analytics is an open-source');
  });

  it('ranks priority fixes without any "undefined" titles or missing rewrites', () => {
    const vm = toAuditViewModel(rawDbAudit);
    const fixes = extractPriorityFixes(vm);

    expect(fixes.length).toBeGreaterThan(0);
    expect(fixes.length).toBeLessThanOrEqual(5);

    // Verify ranks are 1-indexed sequential
    fixes.forEach((fix, idx) => {
      expect(fix.rank).toBe(idx + 1);
      expect(fix.title).not.toContain('undefined');
      expect(fix.description).not.toContain('undefined');
      expect(typeof fix.title).toBe('string');
      expect(fix.title.length).toBeGreaterThan(0);
    });

    // Verify Critical SEO ranks #1
    expect(fixes[0].category).toBe('Technical SEO');
    expect(fixes[0].title).toBe('Missing canonical tag on homepage');

    // Verify Required Schema ranks #2
    expect(fixes[1].category).toBe('Schema Markup');
    expect(fixes[1].title).toBe('Missing Organization structured data');

    // Verify Low Extractability has proper pathname and links codeSnippet from rewrites
    const contentFix = fixes.find(f => f.category === 'Content Extractability');
    expect(contentFix).toBeDefined();
    expect(contentFix.title).toBe('Low extractability on /');
    expect(contentFix.codeSnippet).toContain('Acme Analytics is an open-source');

    // Verify Uncited query is populated from query without undefined
    const visibilityFix = fixes.find(f => f.category === 'AI Visibility');
    expect(visibilityFix).toBeDefined();
    expect(visibilityFix.title).toBe('Uncited for query: "product analytics tools"');
  });
});
