import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { URL } from 'url';

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AEO-Bot';

/**
 * Extracts clean text from an HTML document.
 * @param {string} html 
 * @returns {string} Cleaned body text
 */
export function extractCleanText(html) {
  const $ = cheerio.load(html);
  
  // Remove unwanted elements
  $('script, style, noscript, nav, footer, header, aside, iframe, svg').remove();
  
  // Extract clean text and normalize whitespace
  return $('body').text().replace(/\s+/g, ' ').trim();
}

/**
 * Crawls a single page and extracts its SEO metadata and content.
 * @param {string} url 
 * @returns {Promise<object|null>}
 */
export async function crawlPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract metadata
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // Extract headings
    const h1s = [];
    $('h1').each((_, el) => h1s.push($(el).text().trim()));
    
    const h2s = [];
    $('h2').each((_, el) => h2s.push($(el).text().trim()));

    // Extract images
    const images = [];
    $('img').each((_, el) => {
      images.push({
        src: $(el).attr('src') || '',
        alt: $(el).attr('alt') || ''
      });
    });

    // Extract links
    const links = [];
    $('a').each((_, el) => {
      links.push({
        href: $(el).attr('href') || '',
        text: $(el).text().trim()
      });
    });

    // Other SEO meta tags
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';
    const viewportMeta = $('meta[name="viewport"]').attr('content') || '';

    // OpenGraph tags
    const ogTags = {};
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property').replace('og:', '');
      ogTags[property] = $(el).attr('content');
    });

    // JSON-LD scripts
    const jsonLdScripts = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        jsonLdScripts.push(JSON.parse($(el).html()));
      } catch (e) {
        // Handle invalid JSON gracefully
      }
    });

    const textContent = extractCleanText(html);
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;

    return {
      url,
      title,
      metaDescription,
      h1s,
      h2s,
      images,
      links,
      canonicalUrl,
      robotsMeta,
      viewportMeta,
      ogTags,
      jsonLdScripts,
      textContent,
      wordCount
    };
  } catch (error) {
    console.error(`Error crawling ${url}:`, error.message);
    return null;
  }
}

/**
 * Crawls a site starting from the given URL up to a max depth/pages limit.
 * @param {string} startUrl 
 * @param {object} options 
 * @returns {Promise<Array<object>>}
 */
export async function crawlSite(startUrl, options = { maxPages: 10, maxDepth: 1 }) {
  const visited = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const results = [];
  const startUrlObj = new URL(startUrl);
  
  // Try fetching robots.txt
  let robots = null;
  try {
    const robotsUrl = `${startUrlObj.origin}/robots.txt`;
    const robotsRes = await fetch(robotsUrl);
    if (robotsRes.ok) {
      const robotsTxt = await robotsRes.text();
      robots = robotsParser(robotsUrl, robotsTxt);
    }
  } catch (e) {
    console.warn('Could not fetch robots.txt for domain:', startUrlObj.origin);
  }

  while (queue.length > 0 && results.length < options.maxPages) {
    const { url, depth } = queue.shift();

    // Skip if visited or beyond max depth
    if (visited.has(url) || depth > options.maxDepth) continue;
    
    // Check robots.txt
    if (robots && !robots.isAllowed(url, DEFAULT_USER_AGENT)) {
      continue;
    }

    visited.add(url);
    const pageData = await crawlPage(url);
    
    if (pageData) {
      results.push(pageData);

      // Extract internal links to queue
      if (depth < options.maxDepth) {
        for (const link of pageData.links) {
          try {
            const absoluteUrl = new URL(link.href, url).href;
            const absoluteUrlObj = new URL(absoluteUrl);
            
            // Ensure internal link (same domain), not just an anchor link
            if (absoluteUrlObj.origin === startUrlObj.origin && 
                !absoluteUrl.includes('#') && 
                !visited.has(absoluteUrl)) {
              queue.push({ url: absoluteUrl, depth: depth + 1 });
            }
          } catch (e) {
            // Invalid URL format
          }
        }
      }
    }
  }

  return results;
}
