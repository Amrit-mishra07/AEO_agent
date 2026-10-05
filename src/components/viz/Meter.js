import React from 'react';

/**
 * Horizontal Meter bar component for sub-vector metrics
 *
 * @param {object} props
 * @param {number} props.value - 0 to 100
 * @param {string} props.label
 * @param {string} [props.sublabel]
 * @param {'default' | 'good' | 'warn' | 'bad'} [props.variant]
 * @param {string} [props.unit='/100']
 */
export default function Meter({
  value = 0,
  label,
  sublabel,
  variant,
  unit = '/100',
  className = '',
}) {
  const clampedValue = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  // Auto determine color variant if not explicitly provided
  let color = 'var(--bad)';
  if (variant === 'good' || (!variant && clampedValue >= 80)) color = 'var(--good)';
  else if (variant === 'warn' || (!variant && clampedValue >= 60)) color = 'var(--warn)';

  return (
    <div className={`meter-container ${className}`.trim()} style={{ width: '100%' }}>
      {/* Label Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.35rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>
            {label}
          </span>
          {sublabel && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
              ({sublabel})
            </span>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
          <strong style={{ color: 'var(--text)' }}>{clampedValue}</strong>
          <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>{unit}</span>
        </div>
      </div>

      {/* Bar track */}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={{
          height: 6,
          background: 'var(--bg-sunken)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clampedValue}%`,
            background: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}
