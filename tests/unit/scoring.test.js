import { describe, it, expect } from 'vitest';
import { 
  formatScore, 
  calculateSEOScore, 
  calculateSchemaScore, 
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
