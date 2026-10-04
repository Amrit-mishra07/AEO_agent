import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { URL } from 'url';
import dns from 'dns/promises';
import net from 'net';

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AEO-Bot';
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5 MB max response limit
const REQUEST_TIMEOUT_MS = 8000; // 8 seconds per request

/**
 * Checks if an IP address belongs to a private, loopback, or cloud-metadata network.
 * @param {string} ip 
 * @returns {boolean}
 */
export function isPrivateIP(ip) {
  if (!net.isIP(ip)) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (RFC 1918 Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (RFC 1918 Private: 172.16.0.0 - 172.31.255.255)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (RFC 1918 Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local / Cloud Metadata e.g. AWS/GCP 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (Documentation / TEST-NET)
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true;
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;
    // Broadcast
    if (ip === '255.255.255.255') return true;
    return false;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // Loopback
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // Unspecified
    if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
    // IPv4-mapped IPv6 (::ffff:127.0.0.1 etc.)
    if (normalized.startsWith('::ffff:')) {
      const v4Part = ip.slice(7);
      if (net.isIPv4(v4Part)) return isPrivateIP(v4Part);
    }
    // Unique Local Address (fc00::/7 -> fc00... or fd00...)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // Link-local (fe80::/10)
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
    return false;
  }

  return true;
}

/**
 * Validates a target URL against SSRF attacks (private IPs, illegal protocols).
 * @param {string} urlString 
 * @returns {Promise<{ valid: boolean, reason?: string, resolvedIp?: string }>}
 */
export async function validateSafeUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, reason: 'Malformed URL' };
  }

  // Enforce http/https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: `Disallowed protocol: ${parsed.protocol}. Only http and https are permitted.` };
  }

  // Reject embedded credentials
  if (parsed.username || parsed.password) {
    return { valid: false, reason: 'URLs with embedded credentials are not allowed.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard internal names
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { valid: false, reason: `Blocked internal hostname: ${hostname}` };
  }

  // Direct IP entered as hostname
  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      return { valid: false, reason: `Requests to private or loopback IP ${hostname} are forbidden.` };
    }
    return { valid: true, resolvedIp: hostname };
  }

  // Resolve DNS to verify resolved IP is not private
  try {
    const lookup = await dns.lookup(hostname);
    if (isPrivateIP(lookup.address)) {
      return { valid: false, reason: `Hostname ${hostname} resolves to protected internal IP: ${lookup.address}` };
    }
    return { valid: true, resolvedIp: lookup.address };
  } catch (err) {
    return { valid: false, reason: `Failed to resolve hostname ${hostname}: ${err.message}` };
  }
}

/**
 * Detects if a page is a client-side rendered Single Page Application (SPA) with minimal static HTML.
 * @param {import('cheerio').CheerioAPI} $ 
 * @param {number} wordCount 
 * @returns {{ isSpa: boolean, warning?: string }}
 */
export function detectSpaFramework($, wordCount) {
  const hasSpaRoot = $('#root, #__next, #app, app-root, div[id*="app"], div[id*="root"]').length > 0;
  const hasMinimalContent = wordCount < 150;
  const scriptTags = $('script[src]').length;

  if (hasSpaRoot && hasMinimalContent && scriptTags > 0) {
    return {
      isSpa: true,
      warning: 'Client-side rendered SPA framework detected (e.g. React/Vue/Angular). The server returned minimal static HTML. AI answer engine crawlers may fail to extract content unless Server-Side Rendering (SSR) is configured.'
    };
  }

  return { isSpa: false };
}

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
 * Crawls a single page safely and extracts its SEO metadata and content.
 * @param {string} url 
 * @returns {Promise<object|null>}
 */
export async function crawlPage(url) {
  try {
    // 1. SSRF Guard
    const safetyCheck = await validateSafeUrl(url);
    if (!safetyCheck.valid) {
      console.warn(`[SSRF Blocked] URL: ${url} — Reason: ${safetyCheck.reason}`);
      return null;
    }

    // 2. Fetch with timeout guard
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 3. Inspect Content-Type (must be HTML or text)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      console.warn(`[Crawler Skipped] ${url} returned non-HTML Content-Type: ${contentType}`);
      return null;
    }

    // 4. Response size limit (prevent memory exhaustion)
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_RESPONSE_BYTES) {
      console.warn(`[Crawler Skipped] ${url} exceeds max size: ${contentLength} bytes`);
      return null;
    }

    const html = await response.text();
    if (html.length > MAX_RESPONSE_BYTES) {
      console.warn(`[Crawler Skipped] ${url} body length ${html.length} exceeds limit`);
      return null;
    }

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
      } catch {
        // Handle invalid JSON gracefully
      }
    });

    const textContent = extractCleanText(html);
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;

    // Detect SPA / CSR
    const spaAnalysis = detectSpaFramework($, wordCount);

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
      wordCount,
      isSpa: spaAnalysis.isSpa,
      spaWarning: spaAnalysis.warning || null
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
  // Validate initial URL against SSRF
  const initialSafety = await validateSafeUrl(startUrl);
  if (!initialSafety.valid) {
    throw new Error(`Invalid or disallowed URL: ${initialSafety.reason}`);
  }

  const visited = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const results = [];
  const startUrlObj = new URL(startUrl);
  
  // Try fetching robots.txt safely
  let robots = null;
  try {
    const robotsUrl = `${startUrlObj.origin}/robots.txt`;
    const robotsSafety = await validateSafeUrl(robotsUrl);
    if (robotsSafety.valid) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const robotsRes = await fetch(robotsUrl, { 
        signal: controller.signal,
        headers: { 'User-Agent': DEFAULT_USER_AGENT } 
      });
      clearTimeout(timeoutId);
      if (robotsRes.ok) {
        const robotsTxt = await robotsRes.text();
        robots = robotsParser(robotsUrl, robotsTxt);
      }
    }
  } catch {
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
          } catch {
            // Invalid URL format
          }
        }
      }
    }
  }

  return results;
}
