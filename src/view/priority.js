/**
 * Pure helper to extract and rank the Top 5 priority fixes from an audit view-model.
 * Deterministic ranking: Critical SEO > Required Schema Gaps > Weak Content > Missing Citations.
 */

function formatSnippet(snippet) {
  if (!snippet) return null;
  if (typeof snippet === 'string') return snippet;
  if (snippet.htmlSnippet) return snippet.htmlSnippet;
  if (Array.isArray(snippet)) {
    const list = snippet.map(s => s?.htmlSnippet || (typeof s === 'string' ? s : JSON.stringify(s, null, 2))).filter(Boolean);
    return list.length > 0 ? list.join('\n') : null;
  }
  return JSON.stringify(snippet, null, 2);
}

export function extractPriorityFixes(audit) {
  if (!audit) return [];

  const candidates = [];

  // 1. Critical and Warning SEO Issues
  const seoIssues = audit.seoIssues || [];
  for (const issue of seoIssues) {
    const isCritical = issue.severity?.toLowerCase() === 'critical';
    candidates.push({
      priority: isCritical ? 100 : 60,
      category: 'Technical SEO',
      severity: isCritical ? 'critical' : 'warning',
      title: issue.issue || issue.message || 'Technical indexability issue',
      description: issue.details || issue.message || 'Crawler hygiene defect that impedes AI extraction.',
      impact: 'AI answer engines prioritize static, crawlable HTML with clean canonicals and metadata.',
      pageUrl: issue.pageUrl || null,
      codeSnippet: formatSnippet(issue.generatedFix || issue.fixSuggestion || null),
      codeLanguage: 'html',
    });
  }

  // 2. Schema.org Gaps
  const schemaGaps = audit.schemaGaps || [];
  for (const gap of schemaGaps) {
    const isCritical = gap.status?.toLowerCase() === 'critical' || 
      gap.status?.toLowerCase() === 'required' || 
      gap.importance?.toLowerCase() === 'critical' || 
      gap.importance?.toLowerCase() === 'required';
    candidates.push({
      priority: isCritical ? 90 : 50,
      category: 'Schema Markup',
      severity: isCritical ? 'critical' : 'warning',
      title: `Missing ${gap.schemaType || 'Schema'} structured data`,
      description: gap.details || gap.message || `Add ${gap.schemaType} schema to provide explicit entity data to AI engines.`,
      impact: 'JSON-LD allows LLMs to extract entity attributes directly without probabilistic guessing.',
      pageUrl: gap.pageUrl || null,
      codeSnippet: formatSnippet(gap.generatedFix || null),
      codeLanguage: 'json',
    });
  }

  // 3. Low Content Extractability (< 65 score)
  const contentScores = audit.contentScores || [];
  for (const page of contentScores) {
    if ((page.overallPageScore || 0) < 65) {
      const targetUrl = page.pageUrl || page.url;
      let pathname = 'audited page';
      if (targetUrl) {
        try {
          pathname = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).pathname || '/';
        } catch {
          pathname = targetUrl;
        }
      }

      const matchingRewrite = (audit.contentRewrites || []).find(r => r.pageUrl === targetUrl);
      const snippet = matchingRewrite?.rewrittenContent || page.rewrite || null;

      const topImprovement = Array.isArray(page.suggestedImprovements) && page.suggestedImprovements.length > 0
        ? page.suggestedImprovements[0]
        : 'Restructure text into declarative, factual statements.';
      candidates.push({
        priority: 75,
        category: 'Content Extractability',
        severity: (page.overallPageScore || 0) < 50 ? 'critical' : 'warning',
        title: `Low extractability on ${pathname}`,
        description: topImprovement,
        impact: 'Answer engines require concise definitions and high fact-density to generate citations.',
        pageUrl: targetUrl || null,
        codeSnippet: snippet,
        codeLanguage: 'markdown',
      });
    }
  }

  // 4. Missing Citations
  const citations = audit.citations || [];
  const uncited = citations.filter(c => c.status === 'not_cited' || c.citationType === 'not_cited');
  if (uncited.length > 0 && citations.length > 0) {
    const firstUncited = uncited[0];
    const queryName = firstUncited.query || firstUncited.keyword || 'target query';
    candidates.push({
      priority: 40,
      category: 'AI Visibility',
      severity: 'info',
      title: `Uncited for query: "${queryName}"`,
      description: `Gemini did not retrieve or cite your website for this query in the test probe (${uncited.length} of ${citations.length} uncited).`,
      impact: 'Adding targeted declarative answers and FAQs for this query improves retrieval probability.',
      pageUrl: null,
      codeSnippet: null,
      codeLanguage: 'markdown',
    });
  }

  // Deduplicate and take top 5
  candidates.sort((a, b) => b.priority - a.priority);

  return candidates.slice(0, 5).map((fix, index) => ({
    ...fix,
    id: `priority-fix-${index + 1}`,
    rank: index + 1,
  }));
}
