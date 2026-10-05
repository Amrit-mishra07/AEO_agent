import { describe, it, expect } from 'vitest';
import { computeShareOfVoice } from '@/view/share-of-voice';

describe('Share of Voice Calculator', () => {
  it('handles empty citations array gracefully', () => {
    const res = computeShareOfVoice([], 'example.com');
    expect(res.entities).toEqual([]);
    expect(res.totalProbes).toBe(0);
  });

  it('correctly aggregates target domain citations and competitor mentions', () => {
    const mockCitations = [
      {
        keyword: 'fast database',
        status: 'cited',
        citationType: 'grounded_citation',
        competitors: ['Postgres', 'MongoDB'],
      },
      {
        keyword: 'serverless backend',
        status: 'not_cited',
        citationType: 'not_cited',
        competitors: ['Firebase', 'Postgres'],
      },
    ];

    const res = computeShareOfVoice(mockCitations, 'supabase.com');
    expect(res.totalProbes).toBe(2);
    expect(res.entities.length).toBe(4);

    const target = res.entities.find((e) => e.isTarget);
    expect(target).toBeDefined();
    expect(target.citedCount).toBe(1);
    expect(target.sharePercent).toBe(50);

    const postgres = res.entities.find((e) => e.name === 'Postgres');
    expect(postgres).toBeDefined();
    expect(postgres.citedCount).toBe(2);
    expect(postgres.sharePercent).toBe(100);
  });
});
