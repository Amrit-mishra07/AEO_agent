import React from 'react';

const STEPS = [
  {
    number: '1',
    title: 'Crawl with boundary guards',
    desc: 'We crawl up to 10 pages at depth 1, honoring robots.txt and private network safety checks.',
  },
  {
    number: '2',
    title: 'Analyze hygiene & structured data',
    desc: 'We evaluate 12 technical SEO rules and analyze Schema.org gaps for missing JSON-LD entities.',
  },
  {
    number: '3',
    title: 'Score extractability & probe Gemini',
    desc: 'Gemini evaluates 6 content extractability dimensions and tests whether Google Search Grounding cites your site for up to 5 queries.',
  },
  {
    number: '4',
    title: 'Draft copy-paste fixes',
    desc: 'We generate validated JSON-LD markup, meta tag corrections, content rewrite drafts, and a proposed /llms.txt index.',
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-title" style={{ marginTop: '3.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 id="how-it-works-title" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.015em' }}>
          How it works
        </h2>
        <p className="text-muted text-sm">
          A four-stage diagnostic pipeline from raw crawl to actionable remediation drafts.
        </p>
      </div>

      <ol
        style={{
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {STEPS.map((step) => (
          <li
            key={step.number}
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              background: 'var(--bg)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {step.number}
            </div>

            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.35rem' }}>
              {step.title}
            </h3>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
              {step.desc}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
