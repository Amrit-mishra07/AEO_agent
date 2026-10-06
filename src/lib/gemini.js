import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate text content using Gemini.
 * @param {string} prompt 
 * @param {object} options 
 * @returns {Promise<string>}
 */
export async function generateContent(prompt, options = {}) {
  const model = options.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const config = {};
  
  if (options.temperature !== undefined) config.temperature = options.temperature;
  if (options.maxOutputTokens !== undefined) config.maxOutputTokens = options.maxOutputTokens;
  if (options.responseFormat !== undefined) config.responseMimeType = options.responseFormat;
  if (options.responseSchema) config.responseSchema = options.responseSchema;

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
      return response.text;
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw new Error(`Failed to generate content: ${error.message}`);
      }
      await sleep(delay);
      delay *= 2; // exponential backoff
    }
  }
}

/**
 * Generates content grounded with live Google Search.
 * Extracts web grounding chunks, source URLs, and search queries.
 * @param {string} prompt 
 * @param {object} options 
 * @returns {Promise<{ text: string, sources: Array<{url: string, title: string}>, webSearchQueries: string[] }>}
 */
export async function generateGroundedSearch(prompt, options = {}) {
  const model = options.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const config = {
    tools: [{ googleSearch: {} }]
  };
  
  if (options.temperature !== undefined) config.temperature = options.temperature;

  let retries = 3;
  let delay = 1500;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const candidate = response.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata || {};
      const groundingChunks = groundingMetadata.groundingChunks || [];
      
      const sources = [];
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            url: chunk.web.uri,
            title: chunk.web.title || ''
          });
        }
      }

      return {
        text: response.text || '',
        sources,
        webSearchQueries: groundingMetadata.webSearchQueries || []
      };
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw new Error(`Failed to generate grounded content: ${error.message}`);
      }
      await sleep(delay);
      delay *= 2; // exponential backoff
    }
  }
}

/**
 * Generate JSON output using Gemini.
 * @param {string} prompt 
 * @param {object|null} schemaOrOptions 
 * @param {object} [maybeOptions]
 * @returns {Promise<object>}
 */
export async function generateJSON(prompt, schemaOrOptions = null, maybeOptions = {}) {
  let schema = null;
  let options = {};

  if (schemaOrOptions && typeof schemaOrOptions === 'object') {
    if (schemaOrOptions.type || schemaOrOptions.properties) {
      schema = schemaOrOptions;
      options = maybeOptions || {};
    } else {
      options = schemaOrOptions;
    }
  }

  const mergedOptions = { responseFormat: 'application/json', ...options };
  if (schema) {
    mergedOptions.responseSchema = schema;
  } else {
    prompt += '\n\nPlease respond in valid JSON format.';
  }

  const responseText = await generateContent(prompt, mergedOptions);
  try {
    // Strip markdown formatting if present
    const cleanedText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(cleanedText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error.message}\nResponse: ${responseText}`);
  }
}
