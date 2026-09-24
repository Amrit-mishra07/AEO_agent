/**
 * Heuristics to detect what type of page this is based on its content and URL.
 * @param {object} page 
 * @returns {Array<string>} Detected page types
 */
export function detectPageType(page) {
  const types = [];
  try {
    const urlObj = new URL(page.url);
    if (urlObj.pathname === '/' || urlObj.pathname === '') {
      types.push('Homepage');
    }
  } catch (e) {
    // ignore
  }

  const text = (page.textContent || '').toLowerCase();
  
  if (text.includes('published on') || text.includes('written by') || page.wordCount > 500) {
    types.push('Article');
  }
  
  if ((text.includes('price') || text.includes('$') || text.includes('add to cart')) && text.includes('product')) {
    types.push('Product');
  }

  if (text.includes('frequently asked questions') || text.includes('faq')) {
    types.push('FAQPage');
  }

  if (text.includes('how to') && text.includes('step')) {
    types.push('HowTo');
  }

  if (text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/)) { // phone number pattern
    types.push('LocalBusiness');
  }

  return types;
}

/**
 * Validates a given schema against its required properties.
 * @param {object} schema 
 * @param {string} type 
 * @returns {object} Validation result
 */
export function validateSchema(schema, type) {
  const missingProperties = [];
  const warnings = [];
  let valid = true;

  if (type === 'Organization') {
    if (!schema.name) missingProperties.push('name');
    if (!schema.url) missingProperties.push('url');
    if (!schema.logo) missingProperties.push('logo');
  } else if (type === 'WebSite') {
    if (!schema.name) missingProperties.push('name');
    if (!schema.url) missingProperties.push('url');
  } else if (type === 'BreadcrumbList') {
    if (!schema.itemListElement) missingProperties.push('itemListElement');
  } else if (type === 'Article') {
    if (!schema.headline) missingProperties.push('headline');
    if (!schema.datePublished) missingProperties.push('datePublished');
    if (!schema.author) warnings.push('author');
  } else if (type === 'FAQPage') {
    if (!schema.mainEntity) missingProperties.push('mainEntity');
  } else if (type === 'Product') {
    if (!schema.name) missingProperties.push('name');
    if (!schema.image) missingProperties.push('image');
    if (!schema.offers) missingProperties.push('offers');
    if (!schema.review && !schema.aggregateRating) warnings.push('review or aggregateRating');
  } else if (type === 'HowTo') {
    if (!schema.name) missingProperties.push('name');
    if (!schema.step) missingProperties.push('step');
  }

  if (missingProperties.length > 0) valid = false;

  return { valid, missingProperties, warnings };
}

/**
 * Analyzes existing schema.org markup and identifies gaps across crawled pages.
 * @param {Array<object>} pages 
 * @returns {object}
 */
export function analyzeSchemas(pages) {
  const allSchemas = [];
  const allGaps = [];
  const allIssues = [];

  let validCount = 0;
  let gapCount = 0;
  let issueCount = 0;

  for (const page of pages) {
    const detectedTypes = detectPageType(page);
    const existingSchemas = [];

    // Parse existing schemas
    for (const jsonLd of page.jsonLdScripts) {
      let items = [];
      if (jsonLd['@graph']) {
        items = jsonLd['@graph'];
      } else if (Array.isArray(jsonLd)) {
        items = jsonLd;
      } else {
        items = [jsonLd];
      }

      for (const item of items) {
        const type = item['@type'];
        if (type) {
          existingSchemas.push(type);
          allSchemas.push({ pageUrl: page.url, type, schema: item });
          
          const { valid, missingProperties, warnings } = validateSchema(item, type);
          if (!valid) {
            issueCount++;
            allIssues.push({
              pageUrl: page.url,
              schemaType: type,
              status: 'malformed',
              details: `Missing required properties: ${missingProperties.join(', ')}`,
              missingProperties
            });
          } else {
            validCount++;
          }
          if (warnings.length > 0) {
            allIssues.push({
              pageUrl: page.url,
              schemaType: type,
              status: 'incomplete',
              details: `Recommended properties missing: ${warnings.join(', ')}`,
              warnings
            });
          }
        }
      }
    }

    // Check gaps based on page type
    const expectedSchemas = [];
    if (detectedTypes.includes('Homepage')) {
      expectedSchemas.push('Organization', 'WebSite');
    } else {
      expectedSchemas.push('BreadcrumbList');
    }

    if (detectedTypes.includes('Article')) expectedSchemas.push('Article');
    if (detectedTypes.includes('Product')) expectedSchemas.push('Product');
    if (detectedTypes.includes('FAQPage')) expectedSchemas.push('FAQPage');
    if (detectedTypes.includes('HowTo')) expectedSchemas.push('HowTo');

    for (const expected of expectedSchemas) {
      if (!existingSchemas.includes(expected)) {
        gapCount++;
        allGaps.push({
          pageUrl: page.url,
          schemaType: expected,
          status: 'missing',
          details: `Page appears to be a ${expected} but is missing the corresponding schema.`,
          confidence: 'high'
        });
      }
    }
  }

  // Calculate overall score
  const totalChecks = validCount + gapCount + issueCount;
  const overallScore = totalChecks === 0 ? 100 : Math.max(0, 100 - ((gapCount * 2 + issueCount) / (totalChecks * 2)) * 100);

  return {
    overallScore,
    schemas: allSchemas,
    gaps: allGaps,
    issues: allIssues
  };
}
