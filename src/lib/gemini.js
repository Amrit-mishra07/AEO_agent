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
  const model = options.model || 'gemini-2.5-flash';
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
 * Generate JSON output using Gemini.
 * @param {string} prompt 
 * @param {object|null} schema 
 * @returns {Promise<object>}
 */
export async function generateJSON(prompt, schema = null) {
  const options = { responseFormat: 'application/json' };
  if (schema) {
    options.responseSchema = schema;
  } else {
    prompt += '\n\nPlease respond in valid JSON format.';
  }

  const responseText = await generateContent(prompt, options);
  try {
    // Strip markdown formatting if present
    const cleanedText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(cleanedText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error.message}\nResponse: ${responseText}`);
  }
}
