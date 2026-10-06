// Severity weights
const SEVERITY_WEIGHTS = {
  critical: 3,
  warning: 1.5,
  info: 0.5
};

export function formatScore(score) {
  // Clamp to 0-100, round to integer
  if (score === undefined || score === null || isNaN(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateSEOScore(issues = []) {
  if (!issues || issues.length === 0) return 100;
  
  let score = 100;
  
  // Categorize issues to avoid one bad category tanking the score completely
  const deductionsByCategory = {};
  const MAX_DEDUCTION_PER_CATEGORY = 30; // Maximum points lost per issue category
  
  for (const issue of issues) {
    const category = issue.type || 'general';
    const weight = SEVERITY_WEIGHTS[issue.severity?.toLowerCase()] || SEVERITY_WEIGHTS.info;
    
    if (!deductionsByCategory[category]) {
      deductionsByCategory[category] = 0;
    }
    
    deductionsByCategory[category] += weight;
  }
  
  // Apply deductions with caps
  let totalDeductions = 0;
  for (const deduction of Object.values(deductionsByCategory)) {
    totalDeductions += Math.min(deduction, MAX_DEDUCTION_PER_CATEGORY);
  }
  
  score -= totalDeductions;
  
  return formatScore(score);
}

export function calculateSchemaScore(gaps = [], totalExpected = 0) {
  if (!gaps || gaps.length === 0) return 100;
  if (totalExpected === 0) {
    // If we don't know total expected, just base it on gap importance
    totalExpected = gaps.length * 2; // rough estimate
  }
  
  const IMPORTANCE_WEIGHTS = {
    high: 3,
    medium: 2,
    low: 1
  };
  
  let totalMissingWeight = 0;
  
  for (const gap of gaps) {
    const weight = IMPORTANCE_WEIGHTS[gap.importance?.toLowerCase()] || IMPORTANCE_WEIGHTS.medium;
    totalMissingWeight += weight;
  }
  
  // Total expected represents full points in weight
  const totalPossibleWeight = Math.max(totalExpected * IMPORTANCE_WEIGHTS.medium, totalMissingWeight);
  
  if (totalPossibleWeight === 0) return 100;
  
  const score = 100 - ((totalMissingWeight / totalPossibleWeight) * 100);
  return formatScore(score);
}

export const AEO_WEIGHTS = {
  composite: {
    seo: 0.30,
    schema: 0.20,
    content: 0.30,
    citation: 0.20
  },
  technical: {
    seo: 0.35,
    schema: 0.25,
    content: 0.40
  }
};

/**
 * Calculates deterministic Technical AI Readiness Index (SEO 35%, Schema 25%, Content 40%).
 * Independent of search queries.
 * @param {number} seoScore 
 * @param {number} schemaScore 
 * @param {number} contentScore 
 * @returns {number}
 */
export function calculateTechnicalReadinessScore(seoScore, schemaScore, contentScore) {
  const seo = formatScore(seoScore) * AEO_WEIGHTS.technical.seo;
  const schema = formatScore(schemaScore) * AEO_WEIGHTS.technical.schema;
  const content = formatScore(contentScore) * AEO_WEIGHTS.technical.content;
  return formatScore(seo + schema + content);
}

/**
 * Calculates Empirical AI Visibility Score based on Grounded Citations, Mentions, and Sentiment.
 * Returns null if no queries were tested.
 * @param {Array<object>} citations 
 * @returns {number|null}
 */
export function calculateVisibilityScore(citations = []) {
  if (!citations || citations.length === 0) return null;
  
  let totalScore = 0;
  for (const c of citations) {
    let itemScore = 0;
    const type = c.citation_type || c.citationType || (c.isCited ? 'grounded_citation' : 'not_cited');
    
    if (type === 'grounded_citation') {
      itemScore = 100;
    } else if (type === 'brand_mention') {
      itemScore = 50;
    } else {
      itemScore = 0;
    }

    const sentiment = (c.sentiment || 'neutral').toLowerCase();
    if (sentiment === 'recommended') {
      itemScore = Math.min(100, Math.round(itemScore * 1.2));
    } else if (sentiment === 'criticized') {
      itemScore = Math.round(itemScore * 0.3);
    }

    totalScore += itemScore;
  }

  return formatScore(totalScore / citations.length);
}

/**
 * Calculates overall composite score.
 * If citationScore is null/undefined (no keywords), gracefully defaults to Technical Readiness Score
 * rather than docking 20 points.
 * @param {number} seoScore 
 * @param {number} schemaScore 
 * @param {number} contentScore 
 * @param {number|null} citationScore 
 * @returns {number}
 */
export function calculateOverallScore(seoScore, schemaScore, contentScore, citationScore = null) {
  if (citationScore !== null && citationScore !== undefined && !isNaN(citationScore)) {
    const seo = formatScore(seoScore) * AEO_WEIGHTS.composite.seo;
    const schema = formatScore(schemaScore) * AEO_WEIGHTS.composite.schema;
    const content = formatScore(contentScore) * AEO_WEIGHTS.composite.content;
    const citation = formatScore(citationScore) * AEO_WEIGHTS.composite.citation;
    return formatScore(seo + schema + content + citation);
  }

  // Pure technical readiness when citation was unprobed
  return calculateTechnicalReadinessScore(seoScore, schemaScore, contentScore);
}

export function getScoreGrade(score) {
  const s = formatScore(score);
  if (s >= 95) return 'A+';
  if (s >= 90) return 'A';
  if (s >= 85) return 'B+';
  if (s >= 80) return 'B';
  if (s >= 75) return 'C+';
  if (s >= 70) return 'C';
  if (s >= 60) return 'D';
  return 'F';
}

export function getScoreColor(score) {
  const s = formatScore(score);
  if (s >= 80) return '--accent-primary';
  if (s >= 60) return '--accent-warning';
  return '--accent-danger';
}
