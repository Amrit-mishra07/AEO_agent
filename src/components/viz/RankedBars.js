import React from 'react';

/**
 * Clean Ranked Horizontal Bars visualization for Share of Voice & Competitor comparison
 *
 * @param {object} props
 * @param {Array<{ name: string, sharePercent: number, citedCount: number, isTarget: boolean }>} props.items
 * @param {number} props.totalProbes
 */
export default function RankedBars({ items = [], totalProbes = 0 }) {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
        No competitor citations recorded in probed queries.
      </div>
    );
  }

  return (
    <div className="ranked-bars" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item, idx) => {
        const isTarget = item.isTarget;
        const barColor = isTarget ? 'var(--accent)' : 'var(--text-3)';

        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {/* Header: Name + Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: isTarget ? 700 : 500, color: isTarget ? 'var(--text)' : 'var(--text-2)' }}>
                  {item.name}
                </span>
                {isTarget && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-xs)',
                      fontWeight: 600,
                    }}
                  >
                    Audited Domain
                  </span>
                )}
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                <strong style={{ color: isTarget ? 'var(--accent)' : 'var(--text)' }}>{item.citedCount}</strong>
                <span> / {totalProbes} probes ({item.sharePercent}%)</span>
              </div>
            </div>

            {/* Bar */}
            <div
              style={{
                height: 8,
                background: 'var(--bg-sunken)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(2, item.sharePercent)}%`,
                  background: barColor,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
