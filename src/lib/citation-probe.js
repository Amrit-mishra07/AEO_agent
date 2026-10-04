import { generateGroundedSearch, generateContent } from './gemini.js';
import { URL } from 'url';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Normalizes a URL or hostname to its Apex domain (e.g. blog.posthog.com -> posthog.com).
 * @param {string} urlOrHostname
 * @returns {string}
 */
export function getApexDomain(urlOrHostname) {
  try {
    let hostname = urlOrHostname;
    if (urlOrHostname.includes('://')) {
      hostname = new URL(urlOrHostname).hostname;
    }
    hostname = hostname.replace(/^www\./i, '').toLowerCase();

    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;

    const secondLevelTlds = ['co.uk', 'com.au', 'co.in', 'org.uk', 'gov.uk', 'co.nz', 'co.za', 'com.br', 'co.jp'];
    const lastTwo = parts.slice(-2).join('.');
    if (secondLevelTlds.includes(lastTwo) && parts.length >= 3) {
      return parts.slice(-3).join('.');
    }

    return parts.slice(-2).join('.');
  } catch {
    return urlOrHostname;
  }
}

/**
 * Analyzes sentiment from the sentence contexts where the brand is mentioned.
 * @param {string} contextText
 * @returns {'recommended' | 'neutral' | 'criticized'}
 */
export function detectSentiment(contextText) {
  if (!contextText) return 'neutral';
  const text = contextText.toLowerCase();

  const positiveSignals = ['best', 'top', 'recommend', 'excellent', 'leader', 'preferred', 'popular', 'great', 'ideal', 'standout', 'strong'];
  const negativeSignals = ['expensive', 'drawback', 'limitation', 'struggle', 'lacks', 'downside', 'poor', 'complex', 'steep', 'issue', 'hard'];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of positiveSignals) {
    if (text.includes(word)) positiveScore++;
  }
  for (const word of negativeSignals) {
    if (text.includes(word)) negativeScore++;
  }

  if (positiveScore > negativeScore) return 'recommended';
  if (negativeScore > positiveScore) return 'criticized';
  return 'neutral';
}

/**
 * Analyzes grounded search response against target site and query.
 * Distinguishes verified Grounded Citations, Brand Mentions, Sentiment, and Autonomous Competitors.
 * @param {object} groundedResult 
 * @param {string} siteUrl 
 * @param {string} keyword 
 * @returns {object}
 */
export function analyzeCitation(groundedResult, siteUrl, keyword) {
  const targetApex = getApexDomain(siteUrl);
  const brandName = targetApex.split('.')[0].toLowerCase();
  const textLower = (groundedResult.text || '').toLowerCase();

  let citationType = 'not_cited';
  let sourceUrl = null;
  let citationContext = null;

  // 1. Check if any grounded chunk source URL matches the target apex domain
  const matchingSource = (groundedResult.sources || []).find(src => {
    return getApexDomain(src.url) === targetApex;
  });

  if (matchingSource) {
    citationType = 'grounded_citation';
    sourceUrl = matchingSource.url;
  }

  // 2. Check if brand name is mentioned in text synthesis
  const isMentionedInText = textLower.includes(targetApex) || (brandName.length >= 3 && textLower.includes(brandName));

  if (!matchingSource && isMentionedInText) {
    citationType = 'brand_mention';
  }

  // 3. Extract relevant citation context snippet
  if (citationType !== 'not_cited') {
    const sentences = (groundedResult.text || '').match(/[^.!?]+[.!?]+/g) || [groundedResult.text || ''];
    const matchingSentences = sentences.filter(s => {
      const sLower = s.toLowerCase();
      return sLower.includes(targetApex) || sLower.includes(brandName);
    });
    citationContext = matchingSentences.slice(0, 2).join(' ').trim();
  }

  // 4. Sentiment detection
  const sentiment = detectSentiment(citationContext);

  // 5. Unbiased Competitor Discovery from Grounding Metadata
  const utilityDomains = new Set(['google.com', 'wikipedia.org', 'youtube.com', 'reddit.com', 'twitter.com', 'x.com']);
  const competitors = [];
  const seenCompetitors = new Set();

  for (const src of (groundedResult.sources || [])) {
    const srcApex = getApexDomain(src.url);
    if (srcApex !== targetApex && !utilityDomains.has(srcApex) && !seenCompetitors.has(srcApex)) {
      seenCompetitors.add(srcApex);
      competitors.push(srcApex);
    }
  }

  return {
    citationType,
    isCited: citationType === 'grounded_citation' || citationType === 'brand_mention',
    sourceUrl,
    citationContext,
    sentiment,
    competitors
  };
}

/**
 * Checks if a site is cited by AI engines with live Google Search Grounding.
 * @param {string} siteUrl
 * @param {string[]} keywords
 * @param {object} options
 * @returns {Promise<{ results: Array, summary: object }>}
 */
export async function probeCitations(siteUrl, keywords, options = {}) {
  const results = [];
  let totalGroundedCitations = 0;
  let totalBrandMentions = 0;
  
  // Cap keywords to 5 max to respect rate limits and latency
  const targetKeywords = (keywords || []).slice(0, 5);
  const delayMs = options.delayMs || 2000;

  for (let i = 0; i < targetKeywords.length; i++) {
    const keyword = targetKeywords[i];
    
    try {
      // 1. Probe Gemini with Google Search Grounding
      const prompt = `Answer the following user query objectively as a modern generative search engine. Cite specific authoritative sources, services, and companies where appropriate:\nQuery: "${keyword}"`;
      
      let groundedResult;
      let engineName = 'Gemini (Google Search Grounded)';

      try {
        groundedResult = await generateGroundedSearch(prompt);
      } catch (groundingErr) {
        console.warn(`[Citation Probe] Grounded search failed for "${keyword}", falling back to ungrounded Gemini:`, groundingErr.message);
        const fallbackText = await generateContent(prompt);
        groundedResult = { text: fallbackText, sources: [], webSearchQueries: [] };
        engineName = 'Gemini (Ungrounded Fallback)';
      }

      const analysis = analyzeCitation(groundedResult, siteUrl, keyword);

      results.push({
        keyword,
        engine: engineName,
        isCited: analysis.isCited,
        citationType: analysis.citationType,
        sourceUrl: analysis.sourceUrl,
        sentiment: analysis.sentiment,
        competitors: analysis.competitors,
        competitorsCited: analysis.competitors.length > 0 ? analysis.competitors.join(', ') : 'None detected',
        citationContext: analysis.citationContext,
        responseText: groundedResult.text,
        status: analysis.citationType === 'grounded_citation' ? 'cited' : (analysis.citationType === 'brand_mention' ? 'mentioned' : 'not_cited')
      });

      if (analysis.citationType === 'grounded_citation') {
        totalGroundedCitations++;
      } else if (analysis.citationType === 'brand_mention') {
        totalBrandMentions++;
      }

    } catch (error) {
      console.error(`Failed to probe keyword "${keyword}":`, error);
      results.push({
        keyword,
        engine: 'Gemini',
        isCited: false,
        citationType: 'not_cited',
        sourceUrl: null,
        sentiment: 'neutral',
        competitors: [],
        competitorsCited: 'N/A',
        citationContext: null,
        responseText: null,
        status: 'failed',
        error: error.message
      });
    }

    if (i < targetKeywords.length - 1) {
      await delay(delayMs);
    }
  }

  const totalProbed = results.length;
  // Citation rate measures true grounded source citations
  const citationRate = totalProbed > 0 ? Math.round((totalGroundedCitations / totalProbed) * 100) : 0;
  // Visibility rate measures grounded citations + brand mentions
  const visibilityRate = totalProbed > 0 ? Math.round(((totalGroundedCitations + (totalBrandMentions * 0.5)) / totalProbed) * 100) : 0;

  return {
    results,
    summary: {
      citationRate,
      visibilityRate,
      totalProbed,
      totalGroundedCitations,
      totalBrandMentions
    }
  };
}
