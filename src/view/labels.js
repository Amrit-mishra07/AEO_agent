/**
 * Plain-Language Label Dictionaries
 * Translates technical SEO / AI terminology into clear human terms per Section 11.
 */

export const PILLAR_LABELS = {
  seo: 'Technical SEO',
  schema: 'Structured data',
  content: 'Content readiness',
  visibility: 'AI visibility',
};

export const CONTENT_DIMENSION_LABELS = {
  firstSentenceAnswerability: 'Leads with the answer',
  definitionClarity: 'Explains key terms',
  factSpecificity: 'Backs claims with specifics',
  scannableStructure: 'Easy to skim',
  faqPresence: 'Answers common questions',
  citationReadiness: 'Ready to be quoted',
};

export const CONTENT_DIMENSION_DESCRIPTIONS = {
  firstSentenceAnswerability: 'Does the opening sentence directly answer the search intent?',
  definitionClarity: 'Are key terms and entities explicitly defined for answer engines?',
  factSpecificity: 'Are statements supported with concrete, verifiable metrics and dates?',
  scannableStructure: 'Are there clear headings, lists, or tables for machine parsing?',
  faqPresence: 'Is there a structured question-and-answer format suitable for snippets?',
  citationReadiness: 'Is content organized into self-contained passages easy to quote?',
};

export const CITATION_STATUS_LABELS = {
  grounded_citation: 'Cited with a source link',
  brand_mention: 'Mentioned, no link',
  not_cited: 'Not mentioned',
};

export const SEVERITY_LABELS = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Note',
};

export const EFFORT_LABELS = {
  low: 'Low effort',
  medium: 'Medium effort',
  high: 'High effort',
};

/**
 * Returns descriptive verdict word for a given numerical score.
 * @param {number} score
 * @returns {'Strong' | 'Good' | 'Fair' | 'Weak' | 'Poor'}
 */
export function getScoreVerdict(score) {
  const s = Math.round(Number(score) || 0);
  if (s >= 90) return 'Strong';
  if (s >= 80) return 'Good';
  if (s >= 70) return 'Fair';
  if (s >= 60) return 'Weak';
  return 'Poor';
}
