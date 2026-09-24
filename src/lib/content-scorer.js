import { generateJSON } from './gemini.js';

/**
 * Helper to build the prompt for content scoring.
 * @param {string} pageUrl
 * @param {string} textContent
 * @returns {string}
 */
function buildScoringPrompt(pageUrl, textContent) {
  // Truncate textContent to ~4000 characters to prevent overly large prompts
  const truncatedContent = textContent.length > 4000 ? textContent.slice(0, 4000) + '...' : textContent;

  return `Evaluate the extractability of the following web page content for AI/LLM ingestion.
Page URL: ${pageUrl}

Content:
"""
${truncatedContent}
"""

Score the content on the following 6 dimensions (0 to 100 for each):
1. firstSentenceAnswerability: Does the first sentence/paragraph clearly answer the likely question a user would ask?
2. definitionClarity: Are key terms/concepts clearly defined?
3. factSpecificity: Are claims backed by specific, dated facts rather than vague assertions?
4. scannableStructure: Does the content use headers, bullets, numbered lists effectively?
5. faqPresence: Is there a clear FAQ or Q&A section?
6. citationReadiness: Would an AI system be able to easily extract and cite a clean, self-contained answer?

Provide your response in JSON format exactly matching this schema:
{
  "scores": {
    "firstSentenceAnswerability": number,
    "definitionClarity": number,
    "factSpecificity": number,
    "scannableStructure": number,
    "faqPresence": number,
    "citationReadiness": number
  },
  "feedback": {
    "firstSentenceAnswerability": "string",
    "definitionClarity": "string",
    "factSpecificity": "string",
    "scannableStructure": "string",
    "faqPresence": "string",
    "citationReadiness": "string"
  },
  "overallPageScore": number (average of all scores),
  "suggestedImprovements": ["string", "string", "string"]
}`;
}

/**
 * Helper to pause execution for a given number of milliseconds.
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Scores the extractability of a list of pages.
 * @param {Array<{url: string, textContent: string}>} pages
 * @returns {Promise<{ overallScore: number, pageScores: Array }>}
 */
export async function scoreContentExtractability(pages) {
  const pageScores = [];
  const BATCH_SIZE = 3;
  const BATCH_DELAY_MS = 2000; // 2 seconds between batches to avoid rate limits

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (page) => {
      try {
        const prompt = buildScoringPrompt(page.url, page.textContent || '');
        const result = await generateJSON(prompt);
        return {
          url: page.url,
          scores: result.scores,
          overallPageScore: result.overallPageScore,
          feedback: result.feedback,
          suggestedImprovements: result.suggestedImprovements
        };
      } catch (error) {
        console.error(`Failed to score page ${page.url}:`, error);
        return {
          url: page.url,
          error: error.message,
          overallPageScore: 0,
          scores: {},
          feedback: {},
          suggestedImprovements: []
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    pageScores.push(...batchResults);

    if (i + BATCH_SIZE < pages.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  // Calculate overall score across all successfully scored pages
  const successfulScores = pageScores.filter(p => !p.error && typeof p.overallPageScore === 'number');
  const overallScore = successfulScores.length > 0 
    ? Math.round(successfulScores.reduce((sum, p) => sum + p.overallPageScore, 0) / successfulScores.length)
    : 0;

  return { overallScore, pageScores };
}
