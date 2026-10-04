import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { 
  setDB, 
  createAudit, 
  getAudit, 
  updateAudit, 
  updateAuditStage,
  cleanupStaleAudits,
  addPages, 
  addSEOIssues, 
  addSchemaGaps, 
  addCitations,
  addContentScores, 
  addFixes 
} from '@/lib/db';

describe('SQLite Database Operations (In-Memory)', () => {
  let memDb;

  beforeEach(() => {
    memDb = new Database(':memory:');
    memDb.pragma('foreign_keys = ON');
    setDB(memDb);
  });

  it('creates and retrieves an audit record with default stages', () => {
    const audit = createAudit('https://example.com', ['ai', 'agent']);
    expect(audit).toBeDefined();
    expect(audit.url).toBe('https://example.com');
    expect(audit.status).toBe('pending');
    expect(audit.current_stage).toBe('pending');

    const retrieved = getAudit(audit.id);
    expect(retrieved.id).toBe(audit.id);
    expect(retrieved.pages).toEqual([]);
    expect(retrieved.seo_issues).toEqual([]);
    expect(retrieved.schema_gaps).toEqual([]);
    expect(retrieved.content_scores).toEqual([]);
  });

  it('updates audit status and decoupled score fields', () => {
    const audit = createAudit('https://example.com', ['seo']);
    updateAudit(audit.id, {
      status: 'completed',
      overall_score: 88,
      technical_score: 85,
      visibility_score: 90,
      seo_score: 90,
      content_score: 85
    });

    const updated = getAudit(audit.id);
    expect(updated.status).toBe('completed');
    expect(updated.overall_score).toBe(88);
    expect(updated.technical_score).toBe(85);
    expect(updated.visibility_score).toBe(90);
    expect(updated.seo_score).toBe(90);
    expect(updated.content_score).toBe(85);
  });

  it('updates current stage dynamically', () => {
    const audit = createAudit('https://example.com', ['crawler']);
    updateAuditStage(audit.id, 'crawl');
    expect(getAudit(audit.id).current_stage).toBe('crawl');

    updateAuditStage(audit.id, 'content');
    expect(getAudit(audit.id).current_stage).toBe('content');
  });

  it('cleans up stale audits stuck in running state', () => {
    const audit = createAudit('https://stale.com', ['test']);
    updateAudit(audit.id, { status: 'running' });

    // Artificially age the audit record updated_at by 30 minutes
    memDb.prepare(`
      UPDATE audits 
      SET updated_at = datetime('now', '-30 minutes') 
      WHERE id = ?
    `).run(audit.id);

    const cleaned = cleanupStaleAudits(memDb, 15);
    expect(cleaned).toBe(1);

    const afterCleanup = getAudit(audit.id);
    expect(afterCleanup.status).toBe('failed');
  });

  it('stores and retrieves citations with type, sentiment, and competitors', () => {
    const audit = createAudit('https://example.com', ['analytics']);
    addCitations(audit.id, [
      {
        keyword: 'best product analytics',
        engine: 'Gemini (Google Search Grounded)',
        sourceUrl: 'https://example.com/docs',
        snippet: 'Example is recommended for product analytics.',
        citationType: 'grounded_citation',
        sentiment: 'recommended',
        competitors: ['mixpanel.com', 'amplitude.com']
      }
    ]);

    const retrieved = getAudit(audit.id);
    expect(retrieved.citations.length).toBe(1);
    const cite = retrieved.citations[0];
    expect(cite.target_query).toBe('best product analytics');
    expect(cite.citation_type).toBe('grounded_citation');
    expect(cite.sentiment).toBe('recommended');
    expect(JSON.parse(cite.competitors)).toContain('mixpanel.com');
  });

  it('stores and retrieves granular content scores', () => {
    const audit = createAudit('https://example.com', ['extractability']);
    const scores = [
      {
        url: 'https://example.com/about',
        overallPageScore: 82,
        scores: {
          firstSentenceAnswerability: 85,
          definitionClarity: 80,
          factSpecificity: 75,
          scannableStructure: 90,
          faqPresence: 70,
          citationReadiness: 90
        },
        feedback: { general: 'Good clarity' },
        suggestedImprovements: ['Add FAQ schema', 'Include dates']
      }
    ];

    addContentScores(audit.id, scores);

    const fullAudit = getAudit(audit.id);
    expect(fullAudit.content_scores.length).toBe(1);
    const cs = fullAudit.content_scores[0];
    expect(cs.page_url).toBe('https://example.com/about');
    expect(cs.first_sentence_answerability).toBe(85);
    expect(cs.scannable_structure).toBe(90);
    expect(cs.overall_page_score).toBe(82);
    expect(cs.feedback).toContain('Good clarity');
    expect(JSON.parse(cs.suggested_improvements)).toContain('Add FAQ schema');
  });

  it('persists generated fixes for schema gaps, seo issues, and page rewrites', () => {
    const audit = createAudit('https://example.com', ['fixes']);
    
    // Add page, seo issue, schema gap
    addPages(audit.id, [{ url: 'https://example.com/post', title: 'A Post' }]);
    addSEOIssues(audit.id, [{
      url: 'https://example.com/post',
      category: 'metadata',
      severity: 'warning',
      issue: 'Missing Meta Description'
    }]);
    addSchemaGaps(audit.id, [{
      pageUrl: 'https://example.com/post',
      schemaType: 'Article',
      status: 'missing',
      details: 'Missing Article schema'
    }]);

    // Apply fixes
    const fixes = [
      {
        type: 'schema',
        pageUrl: 'https://example.com/post',
        fix: {
          schemaType: 'Article',
          jsonLd: '{"@context":"https://schema.org","@type":"Article"}',
          instructions: 'Insert in head'
        }
      },
      {
        type: 'meta',
        pageUrl: 'https://example.com/post',
        fix: [{ type: 'description', suggested: 'Optimized meta description' }]
      },
      {
        type: 'content_rewrite',
        pageUrl: 'https://example.com/post',
        fix: { rewrittenContent: '# Restructured Post', changes: ['Clear first sentence'] }
      }
    ];

    addFixes(audit.id, fixes);

    const fullAudit = getAudit(audit.id);
    
    // Check schema fix
    expect(fullAudit.schema_gaps[0].generated_fix).toContain('"@type":"Article"');

    // Check meta fix
    expect(fullAudit.seo_issues[0].generated_fix).toContain('Optimized meta description');

    // Check page rewrite
    expect(fullAudit.pages[0].content_rewrite).toContain('# Restructured Post');
  });
});
