import { extractPriorityFixes } from './priority';

/**
 * Generates an executive summary structure from an audit view-model.
 */
export function generateExecutiveSummary(audit) {
  if (!audit) return null;

  const score = audit.overallScore ?? audit.scores?.overall ?? 0;
  const grade = audit.grade || audit.scores?.grade || 'F';
  const domain = audit.domain || 'Target site';
  const crawledCount = audit.pages?.length || 1;
  const citations = audit.citations || [];
  const probedCount = citations.length;
  const citedCount = citations.filter(c => c.status === 'cited' || c.citationType === 'grounded_citation').length;
  const mentionedCount = citations.filter(c => c.status === 'mentioned' || c.citationType === 'brand_mention').length;

  let headline = 'Critical Synthesis Deficits';
  let verdictText = `The site currently exhibits significant barriers to AI answer engine extraction. Crawlers and LLMs struggle to parse entity facts cleanly.`;

  if (score >= 80) {
    headline = 'Optimal for AI Ingestion';
    verdictText = `The site provides strong technical hygiene and clear content structure, making it straightforward for AI answer engines to index and cite.`;
  } else if (score >= 60) {
    headline = 'Moderate Extractability';
    verdictText = `Core crawlability is functional, but missing entity schemas and informal content structuring limit AI retrieval confidence.`;
  }

  const keyHighlights = [];

  // SEO Highlight
  const criticalSeo = (audit.seoIssues || []).filter(i => i.severity?.toLowerCase() === 'critical').length;
  if (criticalSeo > 0) {
    keyHighlights.push(`${criticalSeo} critical crawler hygiene issue(s) detected that may block AI bot discovery.`);
  } else {
    keyHighlights.push(`Technical SEO baseline is clean with 0 blocking crawler errors.`);
  }

  // Schema Highlight
  const schemaGapCount = (audit.schemaGaps || []).length;
  if (schemaGapCount > 0) {
    keyHighlights.push(`${schemaGapCount} missing Schema.org structured data entities across crawled pages.`);
  } else {
    keyHighlights.push(`Schema markup is comprehensive with key knowledge entities covered.`);
  }

  // Citation Highlight
  if (probedCount > 0) {
    keyHighlights.push(`Gemini cited the domain in ${citedCount} of ${probedCount} test queries (${mentionedCount} brand mention(s)).`);
  } else {
    keyHighlights.push(`AI visibility unprobed (no target customer queries were provided).`);
  }

  return {
    score,
    grade,
    domain,
    headline,
    verdictText,
    keyHighlights,
    probedCount,
    crawledCount,
    citationDisclaimer: probedCount > 0 
      ? `Probed with Gemini 2.5 and Google Search Grounding across ${probedCount} test queries. Generative citations vary; small sample size.` 
      : 'No citation probe was run because no customer questions were entered.',
  };
}

/**
 * Formats a plain-text summary suitable for copying into Slack or email.
 */
export function generatePlainTextSummary(audit, reportUrl = '') {
  const summary = generateExecutiveSummary(audit);
  if (!summary) return '';

  const priorityFixes = extractPriorityFixes(audit);

  const lines = [
    `AEO Diagnostic Summary — ${summary.domain}`,
    `========================================`,
    `Overall Score: ${summary.score}/100 (Grade ${summary.grade})`,
    `Verdict: ${summary.headline}`,
    ``,
    `Key Findings:`,
    ...summary.keyHighlights.map(h => `• ${h}`),
    ``,
    `Scores Breakdown:`,
    `- Technical SEO: ${audit.seoScore ?? '—'}/100`,
    `- Schema Markup: ${audit.schemaScore ?? '—'}/100`,
    `- Content Extractability: ${audit.contentScore ?? '—'}/100`,
    `- AI Citation Visibility: ${audit.citationScore !== null ? `${audit.citationScore}%` : 'Unprobed'}`,
    ``,
  ];

  if (priorityFixes.length > 0) {
    lines.push(`Top Action Items:`);
    priorityFixes.forEach((fix, idx) => {
      lines.push(`${idx + 1}. [${fix.category}] ${fix.title}`);
    });
    lines.push(``);
  }

  if (reportUrl) {
    lines.push(`Full Report: ${reportUrl}`);
  }

  lines.push(`Audited with AEO Agent • ${summary.citationDisclaimer}`);

  return lines.join('\n');
}
