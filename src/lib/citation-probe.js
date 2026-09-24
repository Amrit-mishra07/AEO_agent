import { generateContent } from './gemini.js';

/**
 * Helper to pause execution for a given number of milliseconds.
 * @param {number} ms 
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze the AI response to detect citations.
 * @param {string} response 
 * @param {string} siteUrl 
 * @param {string} keyword 
 * @returns {object}
 */
function analyzeCitationResponse(response, siteUrl, keyword) {
  const urlObj = new URL(siteUrl);
  const domain = urlObj.hostname.replace('www.', '');
  const brandName = domain.split('.')[0].toLowerCase();
  
  const responseLower = response.toLowerCase();
  
  const domainMentioned = responseLower.includes(domain);
  const brandMentioned = responseLower.includes(brandName);
  
  let status = 'not_cited';
  let citationContext = null;
  
  if (domainMentioned || brandMentioned) {
    status = 'cited';
    // Extract the sentence/paragraph containing the mention
    const sentences = response.match(/[^.!?]+[.!?]+/g) || [];
    const contexts = sentences.filter(s => s.toLowerCase().includes(domain) || s.toLowerCase().includes(brandName));
    citationContext = contexts.join(' ').trim();
  }

  // Very naive competitor extraction (could be improved by prompting the LLM for structured output instead)
  const competitorsCited = status === 'not_cited' ? 
    'Other entities mentioned in response (needs manual review)' : 'N/A';

  return {
    status,
    citationContext,
    competitorsCited
  };
}

/**
 * Checks if a site is being cited by AI engines for given keywords.
 * @param {string} siteUrl
 * @param {string[]} keywords
 * @param {object} options
 * @returns {Promise<{ results: Array, summary: object }>}
 */
export async function probeCitations(siteUrl, keywords, options = {}) {
  const results = [];
  let totalCited = 0;
  
  const delayMs = options.delayMs || 2000;

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    
    try {
      // 1. Probe Gemini
      const prompt = `Answer the following query concisely and naturally, as if you are a search engine assisting a user.\nQuery: "${keyword}"`;
      const responseText = await generateContent(prompt);
      
      const analysis = analyzeCitationResponse(responseText, siteUrl, keyword);
      
      results.push({
        keyword,
        engine: 'Gemini',
        isCited: analysis.status === 'cited',
        citationContext: analysis.citationContext,
        competitorsCited: analysis.competitorsCited,
        responseText,
        status: analysis.status
      });

      if (analysis.status === 'cited') {
        totalCited++;
      }

      // 2. Note other engines as not probed
      results.push({
        keyword,
        engine: 'ChatGPT',
        isCited: false,
        citationContext: null,
        competitorsCited: null,
        responseText: null,
        status: 'not_probed',
        message: 'ChatGPT probing requires API access (e.g. OpenAI API key) and is not implemented in this version.'
      });

      results.push({
        keyword,
        engine: 'Perplexity',
        isCited: false,
        citationContext: null,
        competitorsCited: null,
        responseText: null,
        status: 'not_probed',
        message: 'Perplexity probing requires API access and is not implemented.'
      });

    } catch (error) {
      console.error(`Failed to probe keyword "${keyword}":`, error);
    }

    if (i < keywords.length - 1) {
      await delay(delayMs);
    }
  }

  // Calculate summary metrics based only on engines we actually probed (Gemini)
  const probedResults = results.filter(r => r.status !== 'not_probed');
  const totalProbed = probedResults.length;
  const citationRate = totalProbed > 0 ? totalCited / totalProbed : 0;

  return {
    results,
    summary: {
      citationRate,
      totalProbed,
      totalCited
    }
  };
}
