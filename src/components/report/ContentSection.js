'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import HeatTable from '@/components/viz/HeatTable';
import { Layers, Info } from 'lucide-react';

const DIMENSION_LABELS = {
  firstSentenceAnswerability: '1st Sentence Answerability',
  definitionClarity: 'Definition Clarity',
  factSpecificity: 'Fact Specificity',
  scannableStructure: 'Scannable Structure',
  faqPresence: 'FAQ Presence',
  citationReadiness: 'Citation Readiness',
};

export default function ContentSection({ contentScores = [] }) {
  if (!contentScores || contentScores.length === 0) {
    return (
      <section id="extractability" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Content Extractability & Direct Answer Readiness
          </h2>
        </div>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>
            No content extractability evaluations available for this audit.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="extractability" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Content Extractability & Direct Answer Readiness
          </h2>
          <Badge variant="subtle" size="sm">{contentScores.length} Pages</Badge>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)' }}>
          6-dimension LLM evaluation for zero-click AI snippet generation, factual extraction, and definition clarity.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* HeatTable Matrix */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>
            Multi-Page Extractability Matrix
          </div>
          <HeatTable contentScores={contentScores} />
        </div>

        {/* Detailed Page Cards */}
        {contentScores.map((page, idx) => {
          const urlStr = page.pageUrl || page.url || '';
          let pagePath = urlStr;
          try {
            pagePath = new URL(urlStr).pathname || '/';
          } catch {
            // raw
          }

          const dimensions = page.dimensions || page.scores || {};
          const feedback = page.feedback;

          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                    {pagePath}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {urlStr}
                  </div>
                </div>

                <Badge variant={page.overallPageScore >= 80 ? 'good' : page.overallPageScore >= 60 ? 'warn' : 'bad'} size="md">
                  Score: {page.overallPageScore}/100
                </Badge>
              </div>

              {/* 6 Dimension Badges Row */}
              {Object.keys(dimensions).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                  {Object.entries(dimensions).map(([dimKey, dimScore]) => {
                    const label = DIMENSION_LABELS[dimKey] || dimKey;
                    const val = Number(dimScore) || 0;
                    const color = val >= 80 ? 'var(--good)' : val >= 60 ? 'var(--warn)' : 'var(--bad)';

                    return (
                      <div
                        key={dimKey}
                        style={{
                          padding: '0.5rem 0.65rem',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ color: 'var(--text-3)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>
                          {label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>
                          {dimScore ?? '—'}/100
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LLM Feedback & Improvements (object or string safe) */}
              {feedback && typeof feedback === 'object' && Object.keys(feedback).length > 0 ? (
                <div style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Diagnostic Feedback:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {Object.entries(feedback).map(([k, v]) => (
                      <div key={k}>
                        <strong style={{ color: 'var(--text)' }}>
                          {DIMENSION_LABELS[k] || k}:{' '}
                        </strong>
                        <span>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : typeof feedback === 'string' && feedback ? (
                <div style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--text)' }}>Diagnostic Feedback: </strong>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>{feedback}</div>
                </div>
              ) : null}

              {Array.isArray(page.suggestedImprovements) && page.suggestedImprovements.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.35rem' }}>
                    Suggested Content Improvements:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                    {page.suggestedImprovements.map((imp, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {/* Methodology notice */}
        <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
          <Info size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <span>Content extractability scores are probabilistic evaluations performed by Gemini 2.5 Flash against published AEO evaluation criteria.</span>
        </div>
      </div>
    </section>
  );
}
