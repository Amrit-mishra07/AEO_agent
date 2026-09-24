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

export function calculateOverallScore(seoScore, schemaScore, contentScore, citationScore) {
  // Weighted average of all sub-scores
  // Weights: SEO 30%, Schema 20%, Content 30%, Citation 20%
  const WEIGHTS = {
    seo: 0.3,
    schema: 0.2,
    content: 0.3,
    citation: 0.2
  };
  
  const seo = formatScore(seoScore) * WEIGHTS.seo;
  const schema = formatScore(schemaScore) * WEIGHTS.schema;
  const content = formatScore(contentScore) * WEIGHTS.content;
  const citation = formatScore(citationScore) * WEIGHTS.citation;
  
  const total = seo + schema + content + citation;
  return formatScore(total);
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
