import { getScoreGrade, formatScore } from '@/utils/scoring';
import { getScoreVerdict } from './labels';

export function safeJsonParse(val, fallback = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val !== 'string') return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

const IGNORED_COMPETITORS = new Set(['n/a', 'none', 'none detected', 'none found', 'unknown']);

function isCompetitorValid(name) {
  if (!name) return false;
  const str = String(name).trim();
  return str.length > 0 && !IGNORED_COMPETITORS.has(str.toLowerCase());
}

export function normalizeCompetitors(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(isCompetitorValid);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!isCompetitorValid(trimmed)) return [];
    if (trimmed.startsWith('[')) {
      const parsed = safeJsonParse(trimmed, []);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(isCompetitorValid);
      }
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim()).filter(isCompetitorValid);
    }
    return [trimmed];
  }
  return [];
}

export function normalizeKeywords(keywords) {
  if (!keywords) return [];
  if (Array.isArray(keywords)) return keywords.map((k) => String(k).trim()).filter(Boolean);
  if (typeof keywords === 'string') {
    return keywords.split(',').map((k) => k.trim()).filter(Boolean);
  }
  return [];
}

export function extractDomain(urlString) {
  if (!urlString) return '';
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    return url.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return String(urlString).replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
  }
}

/**
 * Transforms raw DB audit object into complete, defensive UI view model.
 * Resolves Q1-Q13 quirks cleanly in one location.
 */
export function toAuditViewModel(rawAudit, history = []) {
  if (!rawAudit) return null;

  const domain = extractDomain(rawAudit.url);
  const keywords = normalizeKeywords(rawAudit.keywords);
  const hasTestedVisibility = keywords.length > 0 && rawAudit.visibility_score !== null && rawAudit.visibility_score !== undefined;

  // Q1 & Q2: Use visibility_score only; discard citation_score
  const visibilityScore = hasTestedVisibility ? formatScore(rawAudit.visibility_score) : null;
  const overallScore = formatScore(rawAudit.overall_score);
  const technicalScore = rawAudit.technical_score !== null && rawAudit.technical_score !== undefined
    ? formatScore(rawAudit.technical_score)
    : overallScore;

  const grade = getScoreGrade(overallScore);
  const verdict = getScoreVerdict(overallScore);

  // Historical delta vs previous completed audit of same hostname
  let delta = null;
  let previousScore = null;
  if (history && history.length > 0) {
    const previous = history.find(
      (h) => h.id !== rawAudit.id && h.status === 'completed' && extractDomain(h.url) === domain && h.completed_at
    );
    if (previous && previous.overall_score !== null && previous.overall_score !== undefined) {
      previousScore = formatScore(previous.overall_score);
      delta = overallScore - previousScore;
    }
  }

  // 1. Pages normalization (Q4: Omit fabricated 200; Q8: Parse content_rewrite)
  const pages = (rawAudit.pages || []).map((p) => ({
    id: p.id,
    url: p.url,
    title: p.title || p.url,
    statusCode: p.status_code || p.statusCode || null,
    isSpa: Boolean(p.is_spa),
    spaWarning: p.spa_warning || null,
    contentRewrite: safeJsonParse(p.content_rewrite, null),
  }));

  const spaPages = pages.filter((p) => p.isSpa);
  const contentRewrites = pages
    .filter((p) => p.contentRewrite && p.contentRewrite.rewrittenContent)
    .map((p) => ({ pageUrl: p.url, ...p.contentRewrite }));

  // 2. SEO Issues normalization (Q3: Split title vs fix_suggestion; Q5: Deduplicate meta fixes)
  const pageMetaFixesMap = new Map();
  const seoIssues = (rawAudit.seo_issues || []).map((row, idx) => {
    const genFixParsed = safeJsonParse(row.generated_fix, row.generated_fix);
    if (row.page_url && Array.isArray(genFixParsed) && genFixParsed.length > 0) {
      if (!pageMetaFixesMap.has(row.page_url)) pageMetaFixesMap.set(row.page_url, genFixParsed);
    }
    let fixSnippet = null;
    if (typeof genFixParsed === 'string') {
      fixSnippet = genFixParsed;
    } else if (Array.isArray(genFixParsed)) {
      const snippets = genFixParsed
        .map(item => item?.htmlSnippet || (typeof item === 'string' ? item : JSON.stringify(item, null, 2)))
        .filter(Boolean);
      fixSnippet = snippets.length > 0 ? snippets.join('\n') : null;
    } else if (genFixParsed && typeof genFixParsed === 'object') {
      fixSnippet = genFixParsed.htmlSnippet || JSON.stringify(genFixParsed, null, 2);
    }

    return {
      id: row.id || `seo-issue-${idx}`,
      category: row.type || 'general',
      severity: (row.severity || 'info').toLowerCase(),
      issue: row.message || 'Issue detected',
      pageUrl: row.page_url || '',
      fixSuggestion: row.fix_suggestion || null,
      generatedFix: fixSnippet,
    };
  });

  const pageMetaFixes = Array.from(pageMetaFixesMap.entries()).map(([pageUrl, fixes]) => ({ pageUrl, fixes }));

  // 3. Schema Gaps normalization (JSON-LD validation & copy)
  const schemaGaps = (rawAudit.schema_gaps || []).map((row, idx) => {
    let fixCode = row.generated_fix || '';
    if (typeof fixCode === 'object') fixCode = JSON.stringify(fixCode, null, 2);

    let isValidJson = false;
    let hasPlaceholders = false;
    if (fixCode) {
      try {
        const parsed = JSON.parse(fixCode);
        isValidJson = true;
        const stringified = JSON.stringify(parsed);
        hasPlaceholders = stringified.includes('null') || /placeholder|example\.com|TODO/i.test(stringified);
      } catch {
        isValidJson = false;
      }
    }

    return {
      id: row.id || `schema-gap-${idx}`,
      schemaType: row.type || 'Thing',
      status: (row.importance || 'missing').toLowerCase(),
      message: row.message || 'Missing schema entity',
      pageUrl: row.page_url || '',
      generatedFix: fixCode,
      isValidJson,
      hasPlaceholders,
    };
  });

  // 4. Content Scores normalization (Q6: Handle LLM scoring failures)
  const rawContentScores = rawAudit.content_scores || [];
  const isContentScored = rawContentScores.length > 0;
  const contentScore = isContentScored ? formatScore(rawAudit.content_score) : null;

  const contentScores = rawContentScores.map((row) => {
    const feedbackObj = safeJsonParse(row.feedback, {});
    const improvementsArr = safeJsonParse(row.suggested_improvements, []);
    const overallPage = formatScore(row.overall_page_score);
    const isPageFailed = overallPage === 0 && Object.keys(feedbackObj).length === 0 && improvementsArr.length === 0;

    return {
      id: row.id,
      pageUrl: row.page_url,
      overallPageScore: overallPage,
      isPageFailed,
      dimensions: {
        firstSentenceAnswerability: formatScore(row.first_sentence_answerability),
        definitionClarity: formatScore(row.definition_clarity),
        factSpecificity: formatScore(row.fact_specificity),
        scannableStructure: formatScore(row.scannable_structure),
        faqPresence: formatScore(row.faq_presence),
        citationReadiness: formatScore(row.citation_readiness),
      },
      feedback: feedbackObj,
      suggestedImprovements: Array.isArray(improvementsArr) ? improvementsArr : [],
    };
  });

  // 5. Citations normalization (Q7: Ungrounded fallback badge & counting)
  let groundedCount = 0;
  let mentionCount = 0;
  let notCitedCount = 0;
  let groundedEligibleCount = 0;

  const citations = (rawAudit.citations || []).map((row, idx) => {
    const isUngrounded = (row.ai_engine || '').includes('Ungrounded Fallback');
    const competitors = normalizeCompetitors(row.competitors);
    const citationType = (row.citation_type || 'not_cited').toLowerCase();
    const sentiment = (row.sentiment || 'neutral').toLowerCase();

    if (!isUngrounded) {
      groundedEligibleCount++;
      if (citationType === 'grounded_citation') groundedCount++;
      else if (citationType === 'brand_mention') mentionCount++;
      else notCitedCount++;
    }

    return {
      id: row.id || `citation-${idx}`,
      query: row.target_query || '',
      engine: row.ai_engine || 'Gemini (Google Search Grounded)',
      isUngrounded,
      citationType,
      sourceUrl: row.source_url || null,
      sentiment,
      snippet: row.snippet || null,
      competitors,
    };
  });

  return {
    id: rawAudit.id,
    url: rawAudit.url,
    domain,
    status: rawAudit.status || 'pending',
    currentStage: rawAudit.current_stage || 'pending',
    createdAt: rawAudit.created_at,
    completedAt: rawAudit.completed_at,
    llmsTxt: rawAudit.llms_txt || '',
    keywords,
    hasTestedVisibility,
    overallScore,
    technicalScore,
    seoScore: formatScore(rawAudit.seo_score),
    schemaScore: formatScore(rawAudit.schema_score),
    contentScore,
    citationScore: visibilityScore,
    visibilityScore,
    grade,
    verdict,
    delta,
    previousScore,
    scores: {
      overall: overallScore,
      technical: technicalScore,
      seo: formatScore(rawAudit.seo_score),
      schema: formatScore(rawAudit.schema_score),
      content: contentScore,
      visibility: visibilityScore,
      grade,
      verdict,
      delta,
      previousScore,
    },
    counts: {
      pages: pages.length,
      seoIssues: seoIssues.length,
      schemaGaps: schemaGaps.length,
      contentScores: contentScores.length,
      citations: citations.length,
      criticalIssues: seoIssues.filter((i) => i.severity === 'critical').length,
      warningIssues: seoIssues.filter((i) => i.severity === 'warning').length,
      infoIssues: seoIssues.filter((i) => i.severity === 'info').length,
    },
    citationsSummary: {
      total: citations.length,
      groundedEligibleCount,
      groundedCount,
      mentionCount,
      notCitedCount,
    },
    pages,
    spaPages,
    contentRewrites,
    seoIssues,
    pageMetaFixes,
    schemaGaps,
    isContentScored,
    contentScores,
    citations,
  };
}
