import { generateContent, generateJSON } from './gemini.js';
import { generateLlmsTxt } from './llmstxt-generator.js';

/**
 * Takes the combined output of all analyzers and generates fixes.
 * @param {object} auditResults
 * @returns {Promise<{ fixes: Array, summary: object }>}
 */
export async function generateFixes(auditResults) {
  const fixes = [];
  const { siteUrl, pages, schemaGaps, seoIssues, lowExtractabilityPages } = auditResults;

  // 1. Schema JSON-LD fixes
  if (schemaGaps && schemaGaps.length > 0) {
    for (const gap of schemaGaps) {
      const pageData = pages.find(p => p.url === gap.pageUrl) || {};
      const schemaFix = await generateSchemaFix(gap, pageData);
      if (schemaFix) {
        fixes.push({ type: 'schema', pageUrl: gap.pageUrl, fix: schemaFix });
      }
    }
  }

  // 2. Meta tag fixes
  if (seoIssues && seoIssues.length > 0) {
    const metaFixes = await generateMetaFixes(seoIssues, pages);
    metaFixes.forEach(mf => {
      fixes.push({ type: 'meta', pageUrl: mf.pageUrl, fix: mf.fixes });
    });
  }

  // 3. Content restructuring suggestions
  if (lowExtractabilityPages && lowExtractabilityPages.length > 0) {
    for (const page of lowExtractabilityPages) {
      const rewrite = await generateContentRewrite(page.pageData, page.feedback);
      if (rewrite) {
        fixes.push({ type: 'content_rewrite', pageUrl: page.pageUrl, fix: rewrite });
      }
    }
  }

  // 4. Generate llms.txt
  if (pages && pages.length > 0) {
    const llmsTxt = await generateLlmsTxt(siteUrl, pages);
    fixes.push({ type: 'llms_txt', fix: llmsTxt });
  }

  return {
    fixes,
    summary: {
      totalFixesGenerated: fixes.length,
      types: fixes.map(f => f.type)
    }
  };
}

/**
 * Generates the correct JSON-LD for a given schema gap.
 * @param {object} gap 
 * @param {object} pageData 
 * @returns {Promise<object>}
 */
export async function generateSchemaFix(gap, pageData) {
  const prompt = `You are an expert SEO specialist. Generate valid JSON-LD schema for a "${gap.schemaType}" entity.
Here is the context about the page:
URL: ${pageData.url || 'Unknown'}
Title: ${pageData.title || 'Unknown'}
Content Excerpt: ${(pageData.textContent || '').slice(0, 1000)}

Generate the appropriate JSON-LD block populated with real data extracted from the page.
If some required fields are missing, use plausible placeholders or null.

Respond ONLY with a JSON object representing the JSON-LD script content. No markdown formatting.`;

  try {
    const jsonLd = await generateJSON(prompt);
    return {
      schemaType: gap.schemaType,
      jsonLd: JSON.stringify(jsonLd, null, 2),
      instructions: `Add this JSON-LD script block to the <head> or <body> of ${pageData.url}.`
    };
  } catch (error) {
    console.error('Failed to generate schema fix:', error);
    return null;
  }
}

/**
 * Generates corrected meta tags for pages with meta issues.
 * @param {Array} seoIssues 
 * @param {Array} pages 
 * @returns {Promise<Array>}
 */
export async function generateMetaFixes(seoIssues, pages) {
  const results = [];
  
  for (const issue of seoIssues) {
    const pageData = pages.find(p => p.url === issue.pageUrl) || {};
    
    const prompt = `You are an expert SEO specialist. Fix the following meta tag issues for this page:
URL: ${issue.pageUrl}
Title: ${pageData.title || 'None'}
Content Excerpt: ${(pageData.textContent || '').slice(0, 500)}
Issues to fix: ${JSON.stringify(issue.problems)}

Provide your response in JSON format exactly matching this schema:
{
  "fixes": [
    {
      "type": "title" | "description" | "og:title" | "og:description",
      "current": "string (the old value)",
      "suggested": "string (the new optimized value)",
      "htmlSnippet": "string (the exact HTML meta or title tag to insert)"
    }
  ]
}`;

    try {
      const response = await generateJSON(prompt);
      if (response && response.fixes) {
        results.push({
          pageUrl: issue.pageUrl,
          fixes: response.fixes
        });
      }
    } catch (error) {
      console.error(`Failed to generate meta fixes for ${issue.pageUrl}:`, error);
    }
  }

  return results;
}

/**
 * Generates a restructured version of key content for better extractability.
 * @param {object} page 
 * @param {object} contentFeedback 
 * @returns {Promise<object>}
 */
export async function generateContentRewrite(page, contentFeedback) {
  const excerpt = (page.textContent || '').slice(0, 1500);

  const prompt = `You are an expert AI content optimizer (AEO). Restructure and rewrite the following content excerpt to improve its extractability and scannability by LLMs and search engines.
Focus on:
1. Providing a clear first-sentence answer to likely user questions.
2. Better structure (use headers, bullets, and short paragraphs).
3. If applicable, structuring as a mini FAQ.

Feedback from the extractability scorer:
${JSON.stringify(contentFeedback)}

Original Excerpt:
"""
${excerpt}
"""

Provide your response in JSON format matching this schema:
{
  "rewrittenContent": "string (the rewritten markdown content)",
  "changes": ["string", "string"] // Bullet points explaining what you changed and why
}`;

  try {
    const response = await generateJSON(prompt);
    return {
      pageUrl: page.url,
      originalExcerpt: excerpt,
      rewrittenContent: response.rewrittenContent,
      changes: response.changes
    };
  } catch (error) {
    console.error(`Failed to generate content rewrite for ${page.url}:`, error);
    return null;
  }
}
