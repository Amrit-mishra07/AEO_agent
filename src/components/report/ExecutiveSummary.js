import React from 'react';
import ScoreRing from '@/components/viz/ScoreRing';
import Meter from '@/components/viz/Meter';
import Badge from '@/components/ui/Badge';
import { generateExecutiveSummary } from '@/view/summary';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExecutiveSummary({ audit }) {
  const summary = generateExecutiveSummary(audit);
  if (!summary) return null;

  return (
    <section
      id="summary"
      style={{
        marginBottom: '2.5rem',
        scrollMarginTop: '100px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        {/* Left Card: Score, Grade & Plain-English Verdict */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-3)',
                }}
              >
                Executive Synthesis
              </span>

              <Badge
                variant={summary.score >= 80 ? 'good' : summary.score >= 60 ? 'warn' : 'bad'}
                size="sm"
              >
                {summary.headline}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <ScoreRing
                score={summary.score}
                grade={summary.grade}
                size="lg"
                label={`Overall AEO score: ${summary.score} of 100, Grade: ${summary.grade}`}
              />

              <div style={{ flex: 1, minWidth: 160 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  {summary.headline}
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
                  {summary.verdictText}
                </p>
              </div>
            </div>
          </div>

          {/* Key Findings Bullets */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {summary.keyHighlights.map((highlight, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>•</span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: 4 Sub-Vector Score Meters */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-3)',
                }}
              >
                Diagnostic Vectors (4 Dimensions)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Meter
                value={audit?.seoScore ?? audit?.scores?.seo ?? 0}
                label="Technical SEO Hygiene"
                sublabel="12 crawl rules"
              />

              <Meter
                value={audit?.schemaScore ?? audit?.scores?.schema ?? 0}
                label="Schema.org Entity Coverage"
                sublabel="JSON-LD markup"
              />

              <Meter
                value={audit?.contentScore ?? audit?.scores?.content ?? 0}
                label="Content Extractability"
                sublabel="6 LLM dimensions"
              />

              <Meter
                value={audit?.citationScore ?? audit?.scores?.visibility ?? 0}
                label="AI Citation Visibility"
                sublabel={audit?.citations?.length ? `${audit.citations.length} probes` : 'Unprobed'}
                unit="%"
              />
            </div>
          </div>

          {/* Honest Methodology Note */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem 1rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
            }}
          >
            <Info size={15} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.45 }}>
              <strong style={{ color: 'var(--text-2)' }}>Methodology Notice: </strong>
              {summary.citationDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
