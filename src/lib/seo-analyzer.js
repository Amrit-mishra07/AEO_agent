function checkTitle(page) {
  if (!page.title) {
    return { passed: false, severity: 'critical', category: 'metadata', issue: 'Missing Title', details: 'The page title is missing.', fixSuggestion: 'Add a <title> tag with descriptive text.' };
  }
  const len = page.title.length;
  if (len < 30 || len > 60) {
    return { passed: false, severity: 'warning', category: 'metadata', issue: 'Title Length', details: `Title is ${len} characters.`, fixSuggestion: 'Keep title length between 30 and 60 characters.' };
  }
  return { passed: true, severity: 'info', category: 'metadata', issue: 'Title OK', details: 'Title length is optimal.', fixSuggestion: '' };
}

function checkMetaDescription(page) {
  if (!page.metaDescription) {
    return { passed: false, severity: 'critical', category: 'metadata', issue: 'Missing Meta Description', details: 'No meta description found.', fixSuggestion: 'Add a meta description.' };
  }
  const len = page.metaDescription.length;
  if (len < 120 || len > 160) {
    return { passed: false, severity: 'warning', category: 'metadata', issue: 'Meta Description Length', details: `Description is ${len} characters.`, fixSuggestion: 'Keep description between 120 and 160 characters.' };
  }
  return { passed: true, severity: 'info', category: 'metadata', issue: 'Meta Description OK', details: 'Description length is optimal.', fixSuggestion: '' };
}

function checkH1(page) {
  if (page.h1s.length === 0) {
    return { passed: false, severity: 'critical', category: 'content', issue: 'Missing H1', details: 'No H1 tag found.', fixSuggestion: 'Add exactly one H1 tag describing the page main topic.' };
  }
  if (page.h1s.length > 1) {
    return { passed: false, severity: 'warning', category: 'content', issue: 'Multiple H1s', details: `Found ${page.h1s.length} H1 tags.`, fixSuggestion: 'Use only one H1 tag per page.' };
  }
  return { passed: true, severity: 'info', category: 'content', issue: 'H1 OK', details: 'Exactly one H1 found.', fixSuggestion: '' };
}

function checkHeadingHierarchy(page) {
  if (page.h1s.length === 0 && page.h2s.length > 0) {
    return { passed: false, severity: 'warning', category: 'content', issue: 'Skipped Heading Levels', details: 'H2 found without an H1.', fixSuggestion: 'Ensure proper heading hierarchy starting with H1.' };
  }
  return { passed: true, severity: 'info', category: 'content', issue: 'Heading Hierarchy OK', details: 'No skipped levels detected.', fixSuggestion: '' };
}

function checkImages(page) {
  const total = page.images.length;
  if (total === 0) return { passed: true, severity: 'info', category: 'content', issue: 'No Images', details: 'No images found on the page.', fixSuggestion: '' };
  
  const missingAlt = page.images.filter(img => !img.alt || img.alt.trim() === '').length;
  
  if (missingAlt > 0) {
    return { passed: false, severity: 'warning', category: 'content', issue: 'Missing Image Alt Text', details: `${missingAlt} out of ${total} images are missing alt text.`, fixSuggestion: 'Add descriptive alt text to all images.' };
  }
  return { passed: true, severity: 'info', category: 'content', issue: 'Images OK', details: 'All images have alt text.', fixSuggestion: '' };
}

function checkLinks(page) {
  const total = page.links.length;
  if (total > 300) {
    return { passed: false, severity: 'warning', category: 'links', issue: 'Too Many Links', details: `Found ${total} links on the page.`, fixSuggestion: 'Reduce the number of links to less than 300.' };
  }
  return { passed: true, severity: 'info', category: 'links', issue: 'Links OK', details: `Found reasonable number of links (${total}).`, fixSuggestion: '' };
}

function checkCanonical(page) {
  if (!page.canonicalUrl) {
    return { passed: false, severity: 'warning', category: 'metadata', issue: 'Missing Canonical Tag', details: 'No canonical URL specified.', fixSuggestion: 'Add a rel="canonical" link tag.' };
  }
  return { passed: true, severity: 'info', category: 'metadata', issue: 'Canonical OK', details: 'Canonical tag is present.', fixSuggestion: '' };
}

function checkRobots(page) {
  const robots = page.robotsMeta.toLowerCase();
  if (robots.includes('noindex') || robots.includes('nofollow')) {
    return { passed: false, severity: 'warning', category: 'metadata', issue: 'Robots Blocking', details: `Robots meta is set to ${page.robotsMeta}.`, fixSuggestion: 'Ensure this page is intended to be blocked from indexing.' };
  }
  return { passed: true, severity: 'info', category: 'metadata', issue: 'Robots OK', details: 'Robots meta allows indexing.', fixSuggestion: '' };
}

function checkViewport(page) {
  if (!page.viewportMeta) {
    return { passed: false, severity: 'critical', category: 'mobile', issue: 'Missing Viewport', details: 'No viewport meta tag found.', fixSuggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">' };
  }
  return { passed: true, severity: 'info', category: 'mobile', issue: 'Viewport OK', details: 'Viewport meta tag is present.', fixSuggestion: '' };
}

function checkOpenGraph(page) {
  const missing = [];
  if (!page.ogTags.title) missing.push('og:title');
  if (!page.ogTags.description) missing.push('og:description');
  if (!page.ogTags.image) missing.push('og:image');
  
  if (missing.length > 0) {
    return { passed: false, severity: 'warning', category: 'social', issue: 'Missing OpenGraph Tags', details: `Missing tags: ${missing.join(', ')}`, fixSuggestion: 'Add missing OpenGraph tags.' };
  }
  return { passed: true, severity: 'info', category: 'social', issue: 'OpenGraph OK', details: 'Essential OpenGraph tags are present.', fixSuggestion: '' };
}

function checkWordCount(page) {
  if (page.wordCount < 300) {
    return { passed: false, severity: 'warning', category: 'content', issue: 'Low Word Count', details: `Word count is ${page.wordCount}.`, fixSuggestion: 'Increase content length to at least 300 words.' };
  }
  return { passed: true, severity: 'info', category: 'content', issue: 'Word Count OK', details: `Word count is ${page.wordCount}.`, fixSuggestion: '' };
}

function checkURLStructure(page) {
  try {
    const urlObj = new URL(page.url);
    if (urlObj.searchParams.toString().length > 50) {
      return { passed: false, severity: 'warning', category: 'url', issue: 'Excessive URL Parameters', details: `URL has many parameters.`, fixSuggestion: 'Use cleaner URLs with fewer parameters.' };
    }
  } catch (e) {
    // ignore parsing errors here
  }
  return { passed: true, severity: 'info', category: 'url', issue: 'URL Structure OK', details: 'URL structure looks clean.', fixSuggestion: '' };
}

/**
 * Analyzes SEO elements across multiple crawled pages.
 * @param {Array<object>} pages 
 * @returns {object}
 */
export function analyzeSEO(pages) {
  const overallIssues = [];
  const pageScores = [];
  let totalWeightedDeductions = 0;
  let totalMaxDeductions = 0;

  for (const page of pages) {
    const checks = [
      checkTitle(page),
      checkMetaDescription(page),
      checkH1(page),
      checkHeadingHierarchy(page),
      checkImages(page),
      checkLinks(page),
      checkCanonical(page),
      checkRobots(page),
      checkViewport(page),
      checkOpenGraph(page),
      checkWordCount(page),
      checkURLStructure(page)
    ];

    let pageWeightedDeductions = 0;
    let pageMaxDeductions = 0;
    const pageIssues = [];

    for (const check of checks) {
      let weight = 0;
      if (check.severity === 'critical') weight = 3;
      else if (check.severity === 'warning') weight = 1.5;
      else if (check.severity === 'info') weight = 0.5;

      pageMaxDeductions += weight;

      if (!check.passed) {
        pageWeightedDeductions += weight;
        pageIssues.push(check);
        overallIssues.push({ url: page.url, ...check });
      }
    }

    const pageScore = 100 - (pageWeightedDeductions / pageMaxDeductions * 100);
    pageScores.push({
      url: page.url,
      score: Math.max(0, pageScore),
      issues: pageIssues
    });

    totalWeightedDeductions += pageWeightedDeductions;
    totalMaxDeductions += pageMaxDeductions;
  }

  const overallScore = totalMaxDeductions > 0 ? 100 - (totalWeightedDeductions / totalMaxDeductions * 100) : 100;

  return {
    overallScore: Math.max(0, overallScore),
    issues: overallIssues,
    pageScores
  };
}
