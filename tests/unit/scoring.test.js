import { describe, it, expect } from 'vitest';
import { 
  formatScore, 
  calculateSEOScore, 
  calculateSchemaScore, 
  calculateTechnicalReadinessScore,
  calculateVisibilityScore,
  calculateOverallScore, 
  getScoreGrade, 
  getScoreColor 
} from '@/utils/scoring';

describe('scoring math and utilities', () => {
  it('clamps and formats scores properly', () => {
    expect(formatScore(-10)).toBe(0);
    expect(formatScore(120)).toBe(100);
    expect(formatScore(84.6)).toBe(85);
    expect(formatScore(null)).toBe(0);
    expect(formatScore(undefined)).toBe(0);
    expect(formatScore(NaN)).toBe(0);
  });

  it('calculates weighted overall score according to specification', () => {
    // Weights: SEO 30%, Schema 20%, Content 30%, Citation 20%
    // 100*0.3 + 100*0.2 + 100*0.3 + 100*0.2 = 100
    expect(calculateOverallScore(100, 100, 100, 100)).toBe(100);

    // 80*0.3 (24) + 60*0.2 (12) + 90*0.3 (27) + 50*0.2 (10) = 73
    expect(calculateOverallScore(80, 60, 90, 50)).toBe(73);
  });

  it('calculates Technical Readiness Index independently', () => {
    // SEO 35%, Schema 25%, Content 40%
    // 100*0.35 + 80*0.25 + 90*0.40 = 35 + 20 + 36 = 91
    expect(calculateTechnicalReadinessScore(100, 80, 90)).toBe(91);

    // When citationScore is null/unprobed, overall score defaults to Technical Readiness
    expect(calculateOverallScore(100, 80, 90, null)).toBe(91);
    expect(calculateOverallScore(100, 80, 90)).toBe(91);
  });

  it('handles null content score honestly without fabricating 50', () => {
    // When content score is null, SEO (0.35) and Schema (0.25) re-weight over 0.60
    // (100 * 0.35 + 80 * 0.25) / 0.60 = (35 + 20) / 0.60 = 55 / 0.60 = 91.666 -> 92
    expect(calculateTechnicalReadinessScore(100, 80, null)).toBe(92);
    expect(calculateOverallScore(100, 80, null, null)).toBe(92);

    // With citation score 80: SEO (0.30) + Schema (0.20) + Citation (0.20) = 0.70
    // (100 * 0.30 + 80 * 0.20 + 80 * 0.20) / 0.70 = (30 + 16 + 16) / 0.70 = 62 / 0.70 = 88.57 -> 89
    expect(calculateOverallScore(100, 80, null, 80)).toBe(89);
  });

  it('calculates Empirical Visibility Score with grounded types and sentiment', () => {
    expect(calculateVisibilityScore([])).toBe(null);
    expect(calculateVisibilityScore(null)).toBe(null);

    const citations = [
      { citation_type: 'grounded_citation', sentiment: 'recommended' }, // 100 * 1.2 = 100 capped
      { citation_type: 'brand_mention', sentiment: 'neutral' },          // 50 * 1.0 = 50
      { citation_type: 'not_cited', sentiment: 'neutral' }               // 0
    ];
    // (100 + 50 + 0) / 3 = 50
    expect(calculateVisibilityScore(citations)).toBe(50);

    const criticized = [
      { citation_type: 'grounded_citation', sentiment: 'criticized' }    // 100 * 0.3 = 30
    ];
    expect(calculateVisibilityScore(criticized)).toBe(30);
  });

  it('heavily discounts ungrounded fallback mentions in visibility score', () => {
    const groundedMention = [
      { citation_type: 'brand_mention', sentiment: 'neutral', isUngrounded: false }
    ];
    expect(calculateVisibilityScore(groundedMention)).toBe(50);

    const ungroundedMention = [
      { citation_type: 'brand_mention', sentiment: 'neutral', isUngrounded: true }
    ];
    // 15 vs 50
    expect(calculateVisibilityScore(ungroundedMention)).toBe(15);
  });

  it('determines correct letter grades', () => {
    expect(getScoreGrade(96)).toBe('A+');
    expect(getScoreGrade(91)).toBe('A');
    expect(getScoreGrade(86)).toBe('B+');
    expect(getScoreGrade(80)).toBe('B');
    expect(getScoreGrade(76)).toBe('C+');
    expect(getScoreGrade(70)).toBe('C');
    expect(getScoreGrade(65)).toBe('D');
    expect(getScoreGrade(45)).toBe('F');
  });

  it('returns corresponding color variables', () => {
    expect(getScoreColor(90)).toBe('--accent-primary');
    expect(getScoreColor(65)).toBe('--accent-warning');
    expect(getScoreColor(50)).toBe('--accent-danger');
  });

  it('calculates SEO and Schema scores from issues/gaps', () => {
    expect(calculateSEOScore([])).toBe(100);
    expect(calculateSchemaScore([])).toBe(100);

    const issues = [
      { type: 'metadata', severity: 'critical' },
      { type: 'metadata', severity: 'warning' }
    ];
    expect(calculateSEOScore(issues)).toBeLessThan(100);
  });
});
