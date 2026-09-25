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
  const radius = isLarge ? 80 : isMini ? 30 : 62;
  const strokeWidth = isLarge ? 12 : isMini ? 6 : 10;
  const center = isLarge ? 90 : isMini ? 36 : 70;
  const svgSize = isLarge ? 180 : isMini ? 72 : 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - animatedScore / 100);

  let colorVar = 'var(--accent-danger)';
  if (safeScore >= 80) colorVar = 'var(--accent-primary)';
  else if (safeScore >= 60) colorVar = 'var(--accent-warning)';

  const gaugeClass = isLarge ? 'gauge-container gauge-large' : isMini ? 'gauge-container gauge-mini' : 'gauge-container';

  return (
    <div className={gaugeClass}>
      <svg className="gauge" width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
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
          stroke={colorVar}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="gauge-value">
        <div className="gauge-score">{animatedScore}</div>
        {grade && <div className="gauge-grade">{grade}</div>}
      </div>
      {label && <div className="gauge-label">{label}</div>}
    </div>
  );
}
