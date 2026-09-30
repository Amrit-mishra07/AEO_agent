'use client';
import { useState, useEffect } from 'react';

export default function SEOScoreGauge({ score, label, size = 'default', grade }) {
  const safeScore = score ?? 0;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(safeScore);
    }, 100);
    return () => clearTimeout(timer);
  }, [safeScore]);

  const isLarge = size === 'large';
  const isMini = size === 'mini';
  const radius = isLarge ? 80 : isMini ? 30 : 58;
  const strokeWidth = isLarge ? 12 : isMini ? 6 : 9;
  const center = isLarge ? 90 : isMini ? 36 : 68;
  const svgSize = isLarge ? 180 : isMini ? 72 : 136;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - animatedScore / 100);

  const gradientId = `gauge-grad-${size}-${safeScore}`;

  let stop1 = '#ef4444';
  let stop2 = '#f87171';
  let glowColor = 'hsla(0, 85%, 60%, 0.3)';

  if (safeScore >= 80) {
    stop1 = '#10b981';
    stop2 = '#34d399';
    glowColor = 'hsla(155, 80%, 50%, 0.35)';
  } else if (safeScore >= 60) {
    stop1 = '#f59e0b';
    stop2 = '#fbbf24';
    glowColor = 'hsla(40, 95%, 55%, 0.3)';
  }

  const gaugeClass = isLarge ? 'gauge-container gauge-large' : isMini ? 'gauge-container gauge-mini' : 'gauge-container';

  return (
    <div className={gaugeClass}>
      <svg className="gauge" width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stop1} />
            <stop offset="100%" stopColor={stop2} />
          </linearGradient>
        </defs>
        <circle
          className="gauge-track"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="gauge-fill"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 6px ${glowColor})`
          }}
        />
      </svg>
      <div className="gauge-value">
        <div className="gauge-score" style={{ fontFamily: 'var(--font-mono)' }}>{animatedScore}</div>
        {grade && <div className="gauge-grade">{grade}</div>}
      </div>
      {label && <div className="gauge-label">{label}</div>}
    </div>
  );
}
