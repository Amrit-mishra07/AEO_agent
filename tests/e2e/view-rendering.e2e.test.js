import { describe, it, expect } from 'vitest';
import { toAuditViewModel } from '@/view/audit-view-model';
import { extractPriorityFixes } from '@/view/priority';
import { computeShareOfVoice } from '@/view/share-of-voice';
import { generateExecutiveSummary, generatePlainTextSummary } from '@/view/summary';

describe('Layer 5: View-Model & Data Integrity Suite (E2E View Contracts)', () => {
  describe('Zero "undefined" Guarantee & Defensiveness', () => {
    it('never produces "undefined" in priority fix titles, descriptions, or URLs on sparse DB records', () => {
      const sparseRawAudit = {
        id: 'sparse-audit-1',
        url: 'https://test-saas.com',
        keywords: JSON.stringify(['ai search query']),
        overall_score: 55,
        technical_score: 60,
        visibility_score: 0,
        seo_score: 50,
        schema_score: 40,
        content_score: 45,
        pages: [
          { id: 1, url: 'https://test-saas.com/features' }, // Missing title, missing status_code
          { id: 2, url: 'https://test-saas.com/about', title: null }
        ],
        seo_issues: [
          { id: 1, issue: null, message: 'Missing meta description', severity: 'critical' },
          { id: 2, issue: 'Broken canonical', severity: 'warning' }
        ],
        schema_gaps: [
          { id: 1, schema_type: 'Organization', importance: 'required', status: 'missing' },
          { id: 2, schema_type: null, importance: 'recommended' }
        ],
        content_scores: [
          { id: 1, url: 'https://test-saas.com/features', overall_page_score: 40 },
          { id: 2, url: null, overall_page_score: 30 }
        ],
        citations: [
          { id: 1, query: null, keyword: 'ai search query', status: 'not_cited' }
        ]
      };

      const viewModel = toAuditViewModel(sparseRawAudit);
      expect(viewModel).not.toBeNull();

      const priorityFixes = extractPriorityFixes(viewModel);
      expect(priorityFixes.length).toBeGreaterThan(0);
      expect(priorityFixes.length).toBeLessThanOrEqual(5);

      for (const fix of priorityFixes) {
        expect(fix.title).not.toContain('undefined');
        expect(fix.description).not.toContain('undefined');
        if (fix.pageUrl) {
          expect(fix.pageUrl).not.toContain('undefined');
        }
      }

      const summary = generateExecutiveSummary(viewModel);
      expect(summary.headline).not.toContain('undefined');
      expect(summary.verdictText).not.toContain('undefined');
      for (const highlight of summary.keyHighlights) {
        expect(highlight).not.toContain('undefined');
      }

      const plainText = generatePlainTextSummary(viewModel, 'https://test-saas.com/report/1');
      expect(plainText).not.toContain('undefined');
    });
  });

  describe('HTTP Status Code Honesty (Q4 Non-fabrication)', () => {
    it('preserves genuine status codes and never fabricates 200 when null or missing', () => {
      const rawAudit = {
        id: 'status-audit-1',
        url: 'https://example.com',
        pages: [
          { id: 1, url: 'https://example.com/', status_code: 200 },
          { id: 2, url: 'https://example.com/missing', status_code: null },
          { id: 3, url: 'https://example.com/unrecorded' } // Undefined in DB row
        ]
      };

      const viewModel = toAuditViewModel(rawAudit);
      expect(viewModel.pages[0].statusCode).toBe(200);
      expect(viewModel.pages[1].statusCode).toBeNull();
      expect(viewModel.pages[2].statusCode).toBeNull();
    });
  });

  describe('Decoupled Scores & Unprobed State Honesty', () => {
    it('accurately represents unprobed visibility when keywords are empty or visibility_score is null', () => {
      const zeroKeywordAudit = {
        id: 'zero-kw-1',
        url: 'https://internal-docs.io',
        keywords: '[]',
        overall_score: 82,
        technical_score: 82,
        visibility_score: null,
        seo_score: 90,
        schema_score: 75,
        content_score: 80,
        pages: [{ id: 1, url: 'https://internal-docs.io/', status_code: 200 }],
        citations: []
      };

      const viewModel = toAuditViewModel(zeroKeywordAudit);
      expect(viewModel.hasTestedVisibility).toBe(false);
      expect(viewModel.visibilityScore).toBeNull();
      expect(viewModel.overallScore).toBe(82);

      const summary = generateExecutiveSummary(viewModel);
      expect(summary.keyHighlights.some(h => h.includes('AI visibility unprobed'))).toBe(true);

      const plainText = generatePlainTextSummary(viewModel);
      expect(plainText).toContain('- AI Citation Visibility: Unprobed');

      // AI Visibility should not appear in priority fixes
      const priorityFixes = extractPriorityFixes(viewModel);
      const visFix = priorityFixes.find(f => f.category === 'AI Visibility');
      expect(visFix).toBeUndefined();
    });
  });

  describe('Competitor Entity Normalization & Share of Voice Calculation', () => {
    it('normalizes multiple competitor formats and excludes target domain', () => {
      const citations = [
        {
          query: 'cloud monitoring',
          status: 'cited',
          citationType: 'grounded_citation',
          competitors: '["Datadog", "Dynatrace"]' // JSON string
        },
        {
          query: 'apm tools',
          status: 'not_cited',
          citationType: 'not_cited',
          competitors: 'New Relic, Datadog' // Comma-separated string
        },
        {
          query: 'server metrics',
          status: 'mentioned',
          citationType: 'brand_mention',
          competitors: ['Dynatrace', 'example.com', 'None detected'] // Array with target & noise
        }
      ];

      const sov = computeShareOfVoice(citations, 'example.com');
      expect(sov.totalProbes).toBe(3);

      // Target domain tally
      const target = sov.entities.find(e => e.isTarget);
      expect(target).toBeDefined();
      expect(target.citedCount).toBe(1);
      expect(target.mentionCount).toBe(1);
      expect(target.sharePercent).toBe(33); // 1 / 3 = 33%

      // Datadog: cited in 2 probes
      const datadog = sov.entities.find(e => e.name === 'Datadog');
      expect(datadog).toBeDefined();
      expect(datadog.citedCount).toBe(2);
      expect(datadog.sharePercent).toBe(67); // 2 / 3 = 67%

      // Dynatrace: cited in 2 probes
      const dynatrace = sov.entities.find(e => e.name === 'Dynatrace');
      expect(dynatrace).toBeDefined();
      expect(dynatrace.citedCount).toBe(2);

      // Discarded values
      expect(sov.entities.find(e => e.name === 'None detected')).toBeUndefined();
      expect(sov.entities.filter(e => e.name.toLowerCase() === 'example.com').length).toBe(1);
    });
  });

  describe('Priority Fix Deterministic Ranking & Content Rewrite Linkage', () => {
    it('enforces ranking order: Critical SEO > Required Schema > Weak Content > Warning SEO > Recommended Schema > Uncited Query', () => {
      const audit = {
        seoIssues: [
          { severity: 'warning', issue: 'Missing H1 heading' },
          { severity: 'critical', issue: 'Robots meta tag blocking indexing' }
        ],
        schemaGaps: [
          { schemaType: 'FAQPage', importance: 'recommended', details: 'Add FAQPage' },
          { schemaType: 'Organization', importance: 'required', details: 'Add Organization' }
        ],
        contentScores: [
          {
            pageUrl: 'https://example.com/poor',
            overallPageScore: 45,
            suggestedImprovements: ['Rewrite with clear declarative facts.']
          }
        ],
        contentRewrites: [
          {
            pageUrl: 'https://example.com/poor',
            rewrittenContent: '# Revised Product Intro\nDeclarative and concise.'
          }
        ],
        citations: [
          { query: 'best aeo tool', status: 'not_cited' }
        ]
      };

      const fixes = extractPriorityFixes(audit);
      expect(fixes.length).toBe(5); // Capped at top 5

      // Rank 1: Critical SEO (priority 100)
      expect(fixes[0].priority).toBe(100);
      expect(fixes[0].category).toBe('Technical SEO');
      expect(fixes[0].title).toContain('Robots meta tag');

      // Rank 2: Required Schema (priority 90)
      expect(fixes[1].priority).toBe(90);
      expect(fixes[1].category).toBe('Schema Markup');
      expect(fixes[1].title).toContain('Organization');

      // Rank 3: Weak Content (priority 75)
      expect(fixes[2].priority).toBe(75);
      expect(fixes[2].category).toBe('Content Extractability');
      expect(fixes[2].codeSnippet).toContain('Revised Product Intro');

      // Rank 4: Warning SEO (priority 60)
      expect(fixes[3].priority).toBe(60);
      expect(fixes[3].category).toBe('Technical SEO');
      expect(fixes[3].title).toContain('Missing H1 heading');

      // Rank 5: Recommended Schema (priority 50)
      expect(fixes[4].priority).toBe(50);
      expect(fixes[4].category).toBe('Schema Markup');
      expect(fixes[4].title).toContain('FAQPage');
    });
  });
});
