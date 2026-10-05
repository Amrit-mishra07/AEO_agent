import React from 'react';

function getCellColor(score) {
  const val = Number(score) || 0;
  if (val >= 80) return { bg: 'var(--good-bg)', text: 'var(--good)', border: 'var(--good-border)' };
  if (val >= 60) return { bg: 'var(--warn-bg)', text: 'var(--warn)', border: 'var(--warn-border)' };
  return { bg: 'var(--bad-bg)', text: 'var(--bad)', border: 'var(--bad-border)' };
}

export default function HeatTable({ contentScores = [] }) {
  if (!contentScores || contentScores.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
        No page-level content extractability evaluations available.
      </div>
    );
  }

  const dimensions = [
    { key: 'firstSentenceAnswerability', label: '1st Sentence' },
    { key: 'definitionClarity', label: 'Definition' },
    { key: 'factSpecificity', label: 'Facts' },
    { key: 'scannableStructure', label: 'Structure' },
    { key: 'faqPresence', label: 'FAQ Block' },
    { key: 'citationReadiness', label: 'Citations' },
  ];

  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'center' }}>
        <caption className="sr-only">Content Extractability Scores Matrix</caption>
        <thead>
          <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-2)', fontWeight: 600 }}>
              Audited Endpoint
            </th>
            {dimensions.map((dim) => (
              <th key={dim.key} style={{ padding: '0.75rem 0.5rem', color: 'var(--text-2)', fontWeight: 600, minWidth: '75px' }}>
                {dim.label}
              </th>
            ))}
            <th style={{ padding: '0.75rem 1rem', color: 'var(--text-2)', fontWeight: 600, minWidth: '80px' }}>
              Overall
            </th>
          </tr>
        </thead>
        <tbody>
          {contentScores.map((row, idx) => {
            const overallColor = getCellColor(row.overallPageScore);
            const targetUrl = row.pageUrl || row.url || '';
            let displayPath = targetUrl;
            try {
              displayPath = new URL(targetUrl).pathname || '/';
            } catch {
              // keep raw
            }

            const dims = row.dimensions || row.scores || {};

            return (
              <tr 
                key={idx} 
                style={{ 
                  borderBottom: idx < contentScores.length - 1 ? '1px solid var(--border)' : 'none',
                  background: 'var(--bg)' 
                }}
              >
                <td style={{ textAlign: 'left', padding: '0.75rem 1rem', maxWidth: '240px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={targetUrl}>
                    {displayPath}
                  </div>
                </td>

                {dimensions.map((dim) => {
                  const scoreVal = dims[dim.key];
                  const cellColor = getCellColor(scoreVal);

                  return (
                    <td key={dim.key} style={{ padding: '0.5rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: cellColor.bg,
                          color: cellColor.text,
                          border: `1px solid ${cellColor.border}`,
                          minWidth: '32px',
                        }}
                      >
                        {scoreVal ?? '—'}
                      </span>
                    </td>
                  );
                })}

                <td style={{ padding: '0.75rem 1rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: overallColor.bg,
                      color: overallColor.text,
                      border: `1px solid ${overallColor.border}`,
                    }}
                  >
                    {row.overallPageScore ?? '—'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
