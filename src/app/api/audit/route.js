import { NextResponse } from 'next/server';
import { 
  createAudit, 
  updateAudit, 
  getAudit, 
  listAudits, 
  addPages, 
  addSEOIssues, 
  addSchemaGaps, 
  addCitations,
  addContentScores,
  addFixes
} from '@/lib/db';
import { crawlSite } from '@/lib/crawler';
import { analyzeSEO } from '@/lib/seo-analyzer';
import { analyzeSchemas } from '@/lib/schema-analyzer';
import { scoreContentExtractability } from '@/lib/content-scorer';
import { generateLlmsTxt } from '@/lib/llmstxt-generator';
import { probeCitations } from '@/lib/citation-probe';
import { generateFixes } from '@/lib/fix-generator';
import { calculateOverallScore, formatScore } from '@/utils/scoring';
import { withTimeout } from '@/utils/timeout';

// GET: list audits or get single audit
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  if (id) {
    const audit = getAudit(id);
    if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(audit);
  }
  return NextResponse.json(listAudits());
}

// POST: create and run audit
export async function POST(request) {
  const body = await request.json();
  const { url, keywords = [] } = body;
  
  // Validate URL
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  
  // Create audit record
  const audit = createAudit(url, keywords);
  
  // Return the audit ID immediately, then run the audit asynchronously
  const auditId = audit.id;
  
  // Start the audit process (don't await — let it run in background)
  runAudit(auditId, url, keywords).catch(err => {
    console.error('Audit failed:', err);
    updateAudit(auditId, { status: 'failed' });
  });
  
  return NextResponse.json({ id: auditId, status: 'running' }, { status: 201 });
}

async function runAudit(auditId, url, keywords) {
  try {
    updateAudit(auditId, { status: 'running' });
    
    // Step 1: Crawl the site
    const pages = await crawlSite(url, { maxPages: 10, maxDepth: 1 });
    addPages(auditId, pages);
    
    // Step 2: SEO Analysis
    const seoResults = analyzeSEO(pages);
    addSEOIssues(auditId, seoResults.issues);
    const seoScore = formatScore(seoResults.overallScore);
    
    // Step 3: Schema Analysis
    const schemaResults = analyzeSchemas(pages);
    addSchemaGaps(auditId, schemaResults.gaps);
    const schemaScore = formatScore(schemaResults.overallScore);
    
    // Step 4: Content Scoring (LLM)
    let contentScore = 50;
    let contentResults = { overallScore: 50, pageScores: [] };
    try {
      contentResults = await withTimeout(
        scoreContentExtractability(pages),
        60000,
        { overallScore: 50, pageScores: [] },
        'Content scoring'
      );
      if (contentResults?.pageScores?.length > 0) {
        addContentScores(auditId, contentResults.pageScores);
      }
      contentScore = formatScore(contentResults.overallScore);
    } catch (e) {
      console.error('Content scoring failed:', e);
      contentScore = 50; // Default if LLM fails
    }
    
    // Step 5: Generate llms.txt
    let llmsTxt = '';
    try {
      const llmsResult = await withTimeout(
        generateLlmsTxt(url, pages),
        30000,
        { content: '' },
        'llms.txt generation'
      );
      llmsTxt = llmsResult?.content || '';
    } catch (e) {
      console.error('llms.txt generation failed:', e);
    }
    
    // Step 6: Citation Probing
    let citationScore = 0;
    try {
      if (keywords && keywords.length > 0) {
        const citationResults = await withTimeout(
          probeCitations(url, keywords),
          45000,
          { results: [], summary: { citationRate: 0 } },
          'Citation probing'
        );
        if (citationResults?.results?.length > 0) {
          addCitations(auditId, citationResults.results);
        }
        citationScore = formatScore(citationResults?.summary?.citationRate ?? 0);
      }
    } catch (e) {
      console.error('Citation probing failed:', e);
    }
    
    // Step 7: Generate fixes
    try {
      const lowExtractabilityPages = (contentResults?.pageScores || [])
        .filter(p => (p.overallPageScore || 0) < 70)
        .map(p => ({
          pageUrl: p.url,
          pageData: pages.find(pg => pg.url === p.url) || {},
          feedback: p.feedback || {}
        }));

      const fixResults = await withTimeout(
        generateFixes({
          siteUrl: url,
          pages,
          seoIssues: seoResults.issues,
          schemaGaps: schemaResults.gaps,
          lowExtractabilityPages
        }),
        60000,
        { fixes: [] },
        'Fix generation'
      );

      if (fixResults?.fixes?.length > 0) {
        addFixes(auditId, fixResults.fixes);
      }
    } catch (e) {
      console.error('Fix generation failed:', e);
    }
    
    // Calculate overall score
    const overallScore = calculateOverallScore(seoScore, schemaScore, contentScore, citationScore);
    
    // Update audit with results
    updateAudit(auditId, {
      status: 'completed',
      overall_score: overallScore,
      seo_score: seoScore,
      schema_score: schemaScore,
      content_score: contentScore,
      citation_score: citationScore,
      llms_txt: llmsTxt,
      completed_at: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Audit failed:', error);
    updateAudit(auditId, { status: 'failed' });
    throw error;
  }
}
