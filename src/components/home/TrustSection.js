import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle, Scale } from 'lucide-react';

const STATEMENTS = [
  {
    icon: CheckCircle2,
    title: 'Grounded source links vs. text mentions',
    desc: 'We differentiate between an AI engine citing your URL as an authoritative source versus merely mentioning your brand name in text.',
  },
  {
    icon: AlertCircle,
    title: 'Sample size transparency',
    desc: 'Citation probes run against at most 5 queries because generative models produce variable answers. We always display the exact test count.',
  },
  {
    icon: Scale,
    title: 'No vanity scores or fabricated boosts',
    desc: 'Scoring uses deterministic, published weightings. We never show fake "+7 point" predictions or pretend draft fixes are ready for production without human review.',
  },
];

export default function TrustSection() {
  return (
    <section aria-labelledby="trust-section-title" style={{ marginTop: '3.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 id="trust-section-title" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.015em' }}>
            Why you can trust the numbers
          </h2>
          <p className="text-muted text-sm">
            Methodology designed for technical clarity, not marketing vanity.
          </p>
        </div>

        <Link
          href="/methodology"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--accent)',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span>Read complete methodology</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {STATEMENTS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: '1.25rem',
                background: 'var(--bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                <Icon size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{s.title}</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
