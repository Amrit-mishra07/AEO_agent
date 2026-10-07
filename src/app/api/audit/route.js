import { NextResponse } from 'next/server';
import { 
  createAudit, 
  updateAudit, 
  updateAuditStage,
  getAudit, 
  listAudits, 
  addPages, 
  addSEOIssues, 
  addSchemaGaps, 
  addCitations,
  addContentScores, 
  addFixes,
  countActiveAudits
} from '@/lib/db';
import { crawlSite, validateSafeUrl } from '@/lib/crawler';
import { analyzeSEO } from '@/lib/seo-analyzer';
import { analyzeSchemas } from '@/lib/schema-analyzer';
import { scoreContentExtractability } from '@/lib/content-scorer';
import { generateLlmsTxt } from '@/lib/llmstxt-generator';
import { probeCitations } from '@/lib/citation-probe';
import { generateFixes } from '@/lib/fix-generator';
import { 
  calculateOverallScore, 
  calculateTechnicalReadinessScore, 
  calculateVisibilityScore, 
  formatScore 
} from '@/utils/scoring';
import { withTimeout } from '@/utils/timeout';

// In-memory sliding-window IP rate limiter
const ipRequestHistory = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Concurrency limiter across runtime instance
let activeAuditsCount = 0;
const MAX_CONCURRENT_AUDITS = 2;

function isAuthorized(request) {
  if (process.env.AEO_API_KEY) {
    const authHeader = request.headers.get('authorization') || '';
    const apiKeyHeader = request.headers.get('x-api-key') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : apiKeyHeader.trim();
    return token === process.env.AEO_API_KEY;
  }
  return true;
}

function getActiveAuditsCount() {
  try {
    const dbCount = countActiveAudits();
    return Math.max(dbCount, activeAuditsCount);
  } catch {
    return activeAuditsCount;
  }
}

function checkRateLimit(ip) {
  const now = Date.now();

  // Prune expired IPs if history grows large
  if (ipRequestHistory.size > 500) {
    for (const [key, timestamps] of ipRequestHistory.entries()) {
      if (timestamps.every(t => now - t >= RATE_LIMIT_WINDOW_MS)) {
        ipRequestHistory.delete(key);
      }
    }
  }

  const timestamps = (ipRequestHistory.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  timestamps.push(now);
  ipRequestHistory.set(ip, timestamps);
  return true;
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

// GET: list audits or get single audit
export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing API key' }, { status: 401 });
  }

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
  // 1. Optional API key authentication if configured
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing API key' }, { status: 401 });
  }

  // 2. Sliding window IP rate limiter
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 5 audits per 10 minutes from this IP address.' },
      { status: 429 }
    );
  }

  // 3. Concurrency limiter (max 2 active simultaneous runs)
  if (getActiveAuditsCount() >= MAX_CONCURRENT_AUDITS) {
    return NextResponse.json(
      { error: 'Server capacity reached. A maximum of 2 audits can run simultaneously. Please retry shortly.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { url, keywords = [] } = body;
  
  // Validate URL
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

  // Early SSRF check
  const safety = await validateSafeUrl(url);
  if (!safety.valid) {
    return NextResponse.json({ error: `Disallowed URL: ${safety.reason}` }, { status: 400 });
  }
  
  // Create audit record
  const audit = createAudit(url, keywords);
  const auditId = audit.id;
  
  // Start the audit process (don't await — let it run asynchronously)
  runAudit(auditId, url, keywords).catch(err => {
    console.error(`Audit ${auditId} failed:`, err);
    updateAudit(auditId, { 
      status: 'failed', 
      current_stage: 'failed',
      error_message: err?.message || 'Audit execution failed'
    });
  });
  
  return NextResponse.json({ id: auditId, status: 'running', stage: 'pending' }, { status: 201 });
}

async function runAudit(auditId, url, keywords) {
  activeAuditsCount++;
  try {
    updateAudit(auditId, { status: 'running', current_stage: 'crawl' });
    
    // Step 1: Crawl the site (with SSRF protection & timeout guards)
    const pages = await crawlSite(url, { maxPages: 10, maxDepth: 1 });
    addPages(auditId, pages);
    
    // Step 2: SEO Analysis
    updateAuditStage(auditId, 'seo');
    const seoResults = analyzeSEO(pages);
    addSEOIssues(auditId, seoResults.issues);
    const seoScore = formatScore(seoResults.overallScore);
    
    // Step 3: Schema Analysis
    updateAuditStage(auditId, 'schema');
    const schemaResults = analyzeSchemas(pages);
    addSchemaGaps(auditId, schemaResults.gaps);
    const schemaScore = formatScore(schemaResults.overallScore);
    
    // Step 4: Content Scoring (LLM with partial saves & concurrency pool)
    updateAuditStage(auditId, 'content');
    let contentScore = null;
    let contentResults = null;
    try {
      contentResults = await withTimeout(
        scoreContentExtractability(pages, {
          onPageScored: async (scored) => {
            addContentScores(auditId, [scored]);
          }
        }),
        60000,
        null,
        'Content scoring'
      );
      if (contentResults && typeof contentResults.overallScore === 'number') {
        contentScore = formatScore(contentResults.overallScore);
      }
    } catch (e) {
      console.error('Content scoring failed:', e);
      contentScore = null;
    }
    
    // Step 5: Generate llms.txt
    updateAuditStage(auditId, 'llms_txt');
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
    
    // Step 6: Empirical Citation Probing (Google Search Grounding)
    updateAuditStage(auditId, 'citation');
    let citationScore = null;
    let citationResults = null;
    const hasKeywords = Array.isArray(keywords) && keywords.length > 0;

    try {
      if (hasKeywords) {
        citationResults = await withTimeout(
          probeCitations(url, keywords),
          45000,
          { results: [], summary: { citationRate: null, visibilityRate: null, timedOut: true } },
          'Citation probing'
        );
        if (citationResults?.results?.length > 0) {
          addCitations(auditId, citationResults.results);
        }
        if (citationResults?.summary?.visibilityRate !== null && citationResults?.summary?.visibilityRate !== undefined) {
          citationScore = formatScore(citationResults.summary.visibilityRate);
        }
      }
    } catch (e) {
      console.error('Citation probing failed:', e);
    }
    
    // Step 7: Generate fixes
    updateAuditStage(auditId, 'fixes');
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
    
    // Calculate decoupled scores
    const technicalScore = calculateTechnicalReadinessScore(seoScore, schemaScore, contentScore);
    const calculatedVis = calculateVisibilityScore(citationResults?.results);
    const visibilityScore = hasKeywords ? (calculatedVis !== null ? calculatedVis : citationScore) : null;
    const overallScore = calculateOverallScore(seoScore, schemaScore, contentScore, visibilityScore);
    
    // Update audit with complete results
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
      llms_txt: llmsTxt,
      completed_at: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Audit failed:', error);
    updateAudit(auditId, { 
      status: 'failed', 
      current_stage: 'failed',
      error_message: error?.message || 'Pipeline execution failed'
    });
    throw error;
  } finally {
    activeAuditsCount = Math.max(0, activeAuditsCount - 1);
  }
}
