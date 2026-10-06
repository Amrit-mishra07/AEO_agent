import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import dns from 'dns/promises';
import { startMockSite } from '../helpers/mock-site';
import { 
  setDB, 
  createAudit, 
  updateAudit, 
  updateAuditStage,
  getAudit, 
  addPages, 
  addSEOIssues, 
  addSchemaGaps, 
  addCitations,
  addContentScores, 
  addFixes 
} from '@/lib/db';
import * as crawler from '@/lib/crawler';
import { analyzeSEO } from '@/lib/seo-analyzer';
import { analyzeSchemas } from '@/lib/schema-analyzer';
import { 
  calculateOverallScore, 
  calculateTechnicalReadinessScore, 
  calculateVisibilityScore, 
  formatScore 
} from '@/utils/scoring';
import { toAuditViewModel } from '@/view/audit-view-model';
import { extractPriorityFixes } from '@/view/priority';
import { computeShareOfVoice } from '@/view/share-of-voice';

describe('Layer 2 & Layer 3: Pipeline & State Persistence (Full E2E)', () => {
  let mockSite;
  let memDb;
  let originalFetch;

  const TEST_DOMAIN = 'mock-aeo-site.test';
  const TEST_SITE_URL = `http://${TEST_DOMAIN}`;

  beforeAll(async () => {
    mockSite = await startMockSite();
    originalFetch = globalThis.fetch;
  });

  afterAll(async () => {
    globalThis.fetch = originalFetch;
    if (mockSite) {
      await mockSite.close();
    }
  });

  beforeEach(() => {
    memDb = new Database(':memory:');
    setDB(memDb);

    // Mock dns.lookup so mock-aeo-site.test resolves to public IP (passes SSRF shield)
    vi.spyOn(dns, 'lookup').mockImplementation(async (host) => {
      return { address: '93.184.216.34', family: 4 };
    });

    // Proxy requests from mock-aeo-site.test to the in-memory Node HTTP fixture
    globalThis.fetch = vi.fn().mockImplementation(async (input, init = {}) => {
      const urlStr = typeof input === 'string' ? input : (input?.url || '');
      const urlObj = new URL(urlStr);
      if (urlObj.hostname === TEST_DOMAIN) {
        urlObj.hostname = '127.0.0.1';
        urlObj.port = String(mockSite.port);
        const headers = new Headers(init.headers || {});
        headers.set('host', TEST_DOMAIN);
        return originalFetch(urlObj.href, { ...init, headers });
      }
      return originalFetch(input, init);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Scenario 1: Full 4-Vector Audit executes, persists to all 6 tables, and yields valid view-model', async () => {
    const siteUrl = TEST_SITE_URL;
    const keywords = ['cloud automation platform', 'mock saas infrastructure'];

    // 1. Initialize Audit
    const auditRecord = createAudit(siteUrl, keywords);
    const auditId = auditRecord.id;
    expect(auditId).toBeDefined();

    // 2. Stage: Crawl
    updateAuditStage(auditId, 'crawl');
    const pages = await crawler.crawlSite(siteUrl, { maxPages: 5, maxDepth: 1 });
    expect(pages.length).toBeGreaterThanOrEqual(2);

    // Verify genuine HTTP 200 statuses and page extraction
    const homePage = pages.find((p) => p.url === `${siteUrl}/` || p.url === siteUrl);
    expect(homePage).toBeDefined();
    expect(homePage.statusCode).toBe(200);
    expect(homePage.title).toContain('Mock SaaS');
    expect(homePage.jsonLdScripts.length).toBeGreaterThan(0);
    expect(homePage.jsonLdScripts[0]['@type']).toBe('Organization');

    addPages(auditId, pages);

    // 3. Stage: SEO Analyzer
    updateAuditStage(auditId, 'seo');
    const seoResults = analyzeSEO(pages);
    expect(typeof seoResults.overallScore).toBe('number');
    expect(seoResults.overallScore).toBeGreaterThanOrEqual(0);
    expect(seoResults.overallScore).toBeLessThanOrEqual(100);
    addSEOIssues(auditId, seoResults.issues);
    const seoScore = formatScore(seoResults.overallScore);

    // 4. Stage: Schema Analyzer
    updateAuditStage(auditId, 'schema');
    const schemaResults = analyzeSchemas(pages);
    expect(schemaResults.schemas.length).toBeGreaterThan(0);
    expect(schemaResults.schemas.some((s) => s.type === 'Organization')).toBe(true);
    addSchemaGaps(auditId, schemaResults.gaps);
    const schemaScore = formatScore(schemaResults.overallScore);

    // 5. Stage: Content Scorer (deterministic mock)
    updateAuditStage(auditId, 'content');
    const simulatedContentScores = pages.map((p) => ({
      url: p.url,
      overallPageScore: 78,
      clarity: 80,
      answerDensity: 75,
      structure: 85,
      entityDisambiguation: 70,
      freshnessConsistency: 80,
      factualityDefensibility: 78,
      feedback: { clarity: 'Clear introductory statements.' },
      suggestedImprovements: ['Add more declarative bullet points with explicit metrics.']
    }));
    addContentScores(auditId, simulatedContentScores);
    const contentScore = 78;

    // 6. Stage: Citation Probing (deterministic mock with grounding & competitors)
    updateAuditStage(auditId, 'citation');
    const simulatedCitations = [
      {
        query: 'cloud automation platform',
        status: 'cited',
        citationType: 'direct_domain',
        sentiment: 'positive',
        engine: 'Gemini 2.5 (Search Grounded)',
        competitors: ['aws.amazon.com', 'google.com/cloud'],
        llmResponse: 'Mock SaaS provides automated infrastructure services.'
      },
      {
        query: 'mock saas infrastructure',
        status: 'not_cited',
        citationType: 'not_cited',
        sentiment: 'neutral',
        engine: 'Gemini 2.5 (Search Grounded)',
        competitors: ['terraform.io', 'pulumi.com'],
        llmResponse: 'Popular cloud automation tools include Terraform and Pulumi.'
      }
    ];
    addCitations(auditId, simulatedCitations);

    // 7. Stage: Fix Generation
    updateAuditStage(auditId, 'fixes');
    const simulatedFixes = [
      {
        type: 'schema',
        schemaType: 'WebSite',
        pageUrl: siteUrl,
        fix: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Mock SaaS' }, null, 2)
      },
      {
        type: 'rewrite',
        pageUrl: `${siteUrl}/docs`,
        rewrittenContent: '## Developer Guide\n\nMock SaaS delivers sub-millisecond cloud API routing.'
      }
    ];
    addFixes(auditId, simulatedFixes);

    // 8. Decoupled Scoring Calculation
    const technicalScore = calculateTechnicalReadinessScore(seoScore, schemaScore, contentScore);
    const calculatedVis = calculateVisibilityScore(simulatedCitations);
    const visibilityScore = calculatedVis;
    const overallScore = calculateOverallScore(seoScore, schemaScore, contentScore, visibilityScore);

    // 9. Update Final Audit State
    updateAudit(auditId, {
      status: 'completed',
      current_stage: 'completed',
      technical_score: technicalScore,
      visibility_score: visibilityScore,
      overall_score: overallScore,
      seo_score: seoScore,
      schema_score: schemaScore,
      content_score: contentScore,
      citation_score: visibilityScore,
      llms_txt: '# llms.txt for Mock SaaS\n> Automated cloud infrastructure platform',
      completed_at: new Date().toISOString()
    });

    // 10. Query complete DB record and verify all tables
    const dbAudit = getAudit(auditId);
    expect(dbAudit.status).toBe('completed');
    expect(dbAudit.current_stage).toBe('completed');
    expect(dbAudit.pages.length).toBeGreaterThanOrEqual(2);
    expect(dbAudit.seo_issues.length).toBeGreaterThan(0);
    expect(dbAudit.schema_gaps.length).toBeGreaterThan(0);
    expect(dbAudit.content_scores.length).toBe(pages.length);
    expect(dbAudit.citations.length).toBe(2);

    // 11. View-Model Integrity Validation
    const viewModel = toAuditViewModel(dbAudit);
    expect(viewModel).not.toBeNull();
    expect(viewModel.overallScore).toBe(overallScore);
    expect(viewModel.technicalScore).toBe(technicalScore);
    expect(viewModel.visibilityScore).toBe(visibilityScore);
    expect(viewModel.hasTestedVisibility).toBe(true);

    // Priority Fixes Extraction
    const priorityFixes = extractPriorityFixes(viewModel);
    expect(priorityFixes.length).toBeGreaterThan(0);
    expect(priorityFixes.length).toBeLessThanOrEqual(5);

    // Check zero 'undefined' strings anywhere in priority fixes
    for (const fix of priorityFixes) {
      expect(fix.title).not.toContain('undefined');
      expect(fix.description).not.toContain('undefined');
      expect(fix.category).toBeDefined();
      expect(fix.severity).toBeDefined();
    }

    // Share of Voice calculation
    const sov = computeShareOfVoice(viewModel.citations, viewModel.domain);
    expect(Array.isArray(sov.entities)).toBe(true);
    expect(sov.entities.length).toBeGreaterThan(0);
  });

  it('Scenario 2: Zero-Keyword Technical Audit decouples visibility cleanly', async () => {
    const siteUrl = TEST_SITE_URL;
    const keywords = []; // No keywords supplied

    const auditRecord = createAudit(siteUrl, keywords);
    const auditId = auditRecord.id;

    // Crawl & SEO & Schema
    const pages = await crawler.crawlSite(siteUrl, { maxPages: 2, maxDepth: 0 });
    addPages(auditId, pages);

    const seoResults = analyzeSEO(pages);
    addSEOIssues(auditId, seoResults.issues);
    const seoScore = formatScore(seoResults.overallScore);

    const schemaResults = analyzeSchemas(pages);
    addSchemaGaps(auditId, schemaResults.gaps);
    const schemaScore = formatScore(schemaResults.overallScore);

    const contentScore = 70;

    // Decoupled Score Calculation (Visibility is null)
    const technicalScore = calculateTechnicalReadinessScore(seoScore, schemaScore, contentScore);
    const visibilityScore = null;
    const overallScore = calculateOverallScore(seoScore, schemaScore, contentScore, visibilityScore);

    // With visibilityScore === null, overallScore MUST strictly equal technicalScore!
    expect(overallScore).toBe(technicalScore);

    updateAudit(auditId, {
      status: 'completed',
      current_stage: 'completed',
      technical_score: technicalScore,
      visibility_score: visibilityScore,
      overall_score: overallScore,
      seo_score: seoScore,
      schema_score: schemaScore,
      content_score: contentScore,
      completed_at: new Date().toISOString()
    });

    const dbAudit = getAudit(auditId);
    expect(dbAudit.visibility_score).toBeNull();

    const viewModel = toAuditViewModel(dbAudit);
    expect(viewModel.hasTestedVisibility).toBe(false);
    expect(viewModel.visibilityScore).toBeNull();
    expect(viewModel.overallScore).toBe(technicalScore);

    // AI Visibility fix should NOT be generated when no citations were probed
    const priorityFixes = extractPriorityFixes(viewModel);
    const visibilityFix = priorityFixes.find((f) => f.category === 'AI Visibility');
    expect(visibilityFix).toBeUndefined();
  });

  it('Scenario 3: Single-Page Application (SPA) detection identifies #root and minimal text', async () => {
    const spaUrl = `${TEST_SITE_URL}/spa`;
    const auditRecord = createAudit(spaUrl, []);
    const auditId = auditRecord.id;

    const pages = await crawler.crawlSite(spaUrl, { maxPages: 1, maxDepth: 0 });
    expect(pages.length).toBe(1);

    const spaPage = pages[0];
    expect(spaPage.isSpa).toBe(true);
    expect(spaPage.spaWarning).toContain('Client-side rendered SPA framework detected');

    addPages(auditId, pages);

    const dbAudit = getAudit(auditId);
    expect(dbAudit.pages[0].is_spa).toBe(1);
    expect(dbAudit.pages[0].spa_warning).toContain('Client-side rendered SPA framework detected');

    const viewModel = toAuditViewModel(dbAudit);
    expect(viewModel.spaPages.length).toBe(1);
    expect(viewModel.spaPages[0].isSpa).toBe(true);
  });
});
