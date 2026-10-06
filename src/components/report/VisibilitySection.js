'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import RankedBars from '@/components/viz/RankedBars';
import { computeShareOfVoice } from '@/view/share-of-voice';
import { Bot, ExternalLink, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VisibilitySection({ citations = [], domain = '' }) {
  const sov = computeShareOfVoice(citations, domain);

  if (!citations || citations.length === 0) {
    return (
      <section id="citations" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            AI Citation Probes & Grounding Visibility
          </h2>
        </div>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>
            No customer search queries were provided for this audit. AI citation tracking was skipped.
          </p>
        </div>
      </section>
    );
  }

  const citedCount = citations.filter(c => c.status === 'cited' || c.citationType === 'grounded_citation').length;
  const mentionCount = citations.filter(c => c.status === 'mentioned' || c.citationType === 'brand_mention').length;

  return (
    <section id="citations" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            AI Citation Probes & Grounding Visibility
          </h2>
          <Badge variant="brand" size="sm">{citations.length} Probes</Badge>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Live queries tested against Gemini 2.5 with Google Search Grounding to observe real-world retrieval.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Competitor Share of Voice Chart */}
        {sov.entities.length > 0 && (
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--text)' }}>
                  Competitor Citation Share of Voice
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  Frequency of entity citations across the {citations.length} probed test queries.
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                {citedCount} cited, {mentionCount} mentions
              </div>
            </div>

            <RankedBars items={sov.entities} totalProbes={citations.length} />
          </div>
        )}

        {/* Probes Table */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            overflowX: 'auto',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>
            Query Probe Breakdown
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <caption className="sr-only">Gemini citation probe results</caption>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-2)', fontWeight: 600 }}>Target Query</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 0.75rem', color: 'var(--text-2)', fontWeight: 600 }}>Engine</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 0.75rem', color: 'var(--text-2)', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-2)', fontWeight: 600 }}>Competitors Cited</th>
              </tr>
            </thead>
            <tbody>
              {citations.map((probe, idx) => {
                const isGrounded = probe.status === 'cited' || probe.citationType === 'grounded_citation';
                const isMentioned = probe.status === 'mentioned' || probe.citationType === 'brand_mention';
                const statusBadge = isGrounded
                  ? { variant: 'good', label: 'Grounded Citation' }
                  : isMentioned
                  ? { variant: 'warn', label: 'Brand Mention' }
                  : { variant: 'bad', label: 'Not Cited' };

                const competitors = Array.isArray(probe.competitors) ? probe.competitors : [];

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx < citations.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text)' }}>
                      &ldquo;{probe.query || probe.keyword || 'Search query'}&rdquo;
                      {probe.sourceUrl && (
                        <div style={{ marginTop: '0.2rem' }}>
                          <a
                            href={probe.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--accent)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              textDecoration: 'none',
                            }}
                          >
                            <span>Grounded source link</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-2)', fontSize: '0.75rem' }}>
                      <div>{probe.engine || 'Gemini (Google Search Grounded)'}</div>
                      {probe.isUngrounded && (
                        <div style={{ marginTop: '0.25rem' }}>
                          <Badge variant="warn" size="sm">Fallback - not grounded</Badge>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <Badge variant={statusBadge.variant} size="sm">
                        {statusBadge.label}
                      </Badge>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-2)' }}>
                      {competitors.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {competitors.map((c, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.7rem',
                                background: 'var(--bg-sunken)',
                                border: '1px solid var(--border)',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-xs)',
                              }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Methodology notice */}
        <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
          <Info size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <span>Citation probes are empirical tests evaluated against Google Search Grounding with Gemini 2.5 Flash (sample size: {citations.length} queries). Answer engine retrieval exhibits variance between runs.</span>
        </div>

      </div>
    </section>
  );
}
