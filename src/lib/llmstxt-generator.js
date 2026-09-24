import { generateContent } from './gemini.js';

/**
 * Helper to build the prompt for llms.txt generation.
 * @param {string} siteUrl 
 * @param {Array<{url: string, title: string, textContent: string}>} pages 
 * @returns {string}
 */
function buildLlmsTxtPrompt(siteUrl, pages) {
  const MAX_PAGE_CHARS = 1000;
  
  const pagesData = pages.map(page => {
    const truncated = page.textContent ? 
      (page.textContent.length > MAX_PAGE_CHARS ? page.textContent.slice(0, MAX_PAGE_CHARS) + '...' : page.textContent) : 
      '';
    return `URL: ${page.url}\nTitle: ${page.title}\nExcerpt: ${truncated}`;
  }).join('\n\n');

  return `You are generating a curated 'llms.txt' file for the website: ${siteUrl}.
This file will be used by Large Language Models to quickly understand the site's contents and navigate it.

Follow the llms.txt specification strictly:
1. Start with an H1 containing the Site/Project name (inferred from the URL or the provided data).
2. Add a blockquote (> ) immediately below the H1 with a 1-2 sentence concise summary of what the site/business does.
3. Group the pages into logical H2 categories based on their purpose and content.
4. Within each H2 category, list the relevant pages as markdown links.
5. Add a very concise (1 sentence) description next to each link, like this: "- [Page Title](url) - Brief description."

Sort the links by relevance within each category. Prioritize the most important pages.
Keep the overall output extremely concise (under 2000 words).

Here are the pages crawled from the site:
"""
${pagesData}
"""

Return ONLY the generated raw markdown for the llms.txt file. Do not include any intro or outro text or markdown code fences.`;
}

/**
 * Generates a curated llms.txt file from crawled site data.
 * @param {string} siteUrl
 * @param {Array<{url: string, title: string, textContent: string}>} pages
 * @returns {Promise<{ content: string, pageCount: number }>}
 */
export async function generateLlmsTxt(siteUrl, pages) {
  if (!pages || pages.length === 0) {
    return { content: '', pageCount: 0 };
  }

  try {
    const prompt = buildLlmsTxtPrompt(siteUrl, pages);
    let content = await generateContent(prompt);
    
    // Clean up if the model wrapped it in markdown code blocks
    if (content.startsWith('```markdown')) {
      content = content.replace(/^```markdown\s*/i, '').replace(/\s*```$/i, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return {
      content: content.trim(),
      pageCount: pages.length
    };
  } catch (error) {
    console.error('Failed to generate llms.txt:', error);
    throw error;
  }
}
