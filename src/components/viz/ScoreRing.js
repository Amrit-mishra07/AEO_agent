import React, { useId } from 'react';

/**
 * Hand-written SVG Radial Progress Ring
 * Starts at 12 o'clock, deterministic geometry, zero runtime charting dependencies.
 *
 * @param {object} props
 * @param {number} props.score - 0 to 100
 * @param {string} [props.grade] - 'A+', 'A', 'B', 'C', 'D', 'F'
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.label] - Accessible label
 * @param {boolean} [props.showGrade=true]
 */
export default function ScoreRing({
  score = 0,
  grade,
  size = 'md',
  label,
  showGrade = true,
  className = '',
}) {
  const gradientId = useId();
  const clampedScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

  // Color mapping based on score
  let statusColor = 'var(--bad)';
  if (clampedScore >= 80) statusColor = 'var(--good)';
  else if (clampedScore >= 60) statusColor = 'var(--warn)';

  // Dimensions per size
  const config = {
    sm: { dimension: 64, stroke: 5, radius: 26, fontSize: '1rem', gradeSize: '0.65rem' },
    md: { dimension: 104, stroke: 7, radius: 44, fontSize: '1.5rem', gradeSize: '0.75rem' },
    lg: { dimension: 144, stroke: 9, radius: 62, fontSize: '2.1rem', gradeSize: '0.85rem' },
  }[size] || { dimension: 104, stroke: 7, radius: 44, fontSize: '1.5rem', gradeSize: '0.75rem' };

  const center = config.dimension / 2;
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const accessibleLabel = label || `Score: ${clampedScore} out of 100${grade ? `, Grade: ${grade}` : ''}`;

  return (
    <div
      className={`score-ring score-ring-${size} ${className}`.trim()}
      style={{
        position: 'relative',
        width: config.dimension,
        height: config.dimension,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="img"
      aria-label={accessibleLabel}
    >
      <svg
        width={config.dimension}
        height={config.dimension}
        viewBox={`0 0 ${config.dimension} ${config.dimension}`}
        style={{ transform: 'rotate(-90deg)', display: 'block' }}
      >
        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={config.stroke}
        />

        {/* Progress active stroke starting at 12 o'clock */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          stroke={statusColor}
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>

      {/* Centered Score & Grade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: config.fontSize,
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.03em',
          }}
        >
          {clampedScore}
        </span>
        {showGrade && grade && size !== 'sm' && (
          <span
            style={{
              fontSize: config.gradeSize,
              fontWeight: 700,
              color: statusColor,
              marginTop: size === 'lg' ? 4 : 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {grade}
          </span>
        )}
      </div>
    </div>
  );
}
