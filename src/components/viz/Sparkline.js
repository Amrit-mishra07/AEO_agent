import React from 'react';

/**
 * Micro SVG Sparkline for score trends
 * @param {object} props
 * @param {number[]} props.points - Array of numerical scores (e.g. [60, 72, 85])
 * @param {number} [props.width=64]
 * @param {number} [props.height=20]
 * @param {string} [props.className='']
 */
export default function Sparkline({ points = [], width = 64, height = 20, className = '' }) {
  if (!points || points.length < 2) {
    return (
      <span className={`text-muted text-xs ${className}`} style={{ fontStyle: 'italic' }}>
        No trend
      </span>
    );
  }

  const min = Math.min(...points, 0);
  const max = Math.max(...points, 100);
  const range = max - min || 1;

  const padding = 2;
  const drawWidth = width - padding * 2;
  const drawHeight = height - padding * 2;

  const coords = points.map((val, idx) => {
    const x = padding + (idx / (points.length - 1)) * drawWidth;
    const y = height - padding - ((val - min) / range) * drawHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = coords.join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const isUp = last > first;
  const isDown = last < first;
  const strokeColor = isUp ? 'var(--good)' : isDown ? 'var(--bad)' : 'var(--text-3)';

  return (
    <svg
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={`Score trend from ${first} to ${last}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
      />
      {/* End point dot */}
      {coords.length > 0 && (
        <circle
          cx={coords[coords.length - 1].split(',')[0]}
          cy={coords[coords.length - 1].split(',')[1]}
          r="2"
          fill={strokeColor}
        />
      )}
    </svg>
  );
}
