'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';
import Disclosure from '@/components/ui/Disclosure';
import { Code2, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SchemaSection({ gaps = [] }) {
  if (!gaps || gaps.length === 0) {
    return (
      <section id="schemas" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Schema Markup & Structured Data
          </h2>
        </div>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' }}>
          <CheckCircle2 size={32} style={{ color: 'var(--good)', margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text)' }}>
            Comprehensive Entity Coverage
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)' }}>
            All standard knowledge graph schemas (Organization, Article, WebSite) are present and valid.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="schemas" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Schema.org Structured Data Gaps
          </h2>
          <Badge variant="warn" size="sm">{gaps.length} Gaps</Badge>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Explicit JSON-LD schemas provide AI engines unambiguous knowledge graph entities without semantic hallucination.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {gaps.map((gap) => {
          const isCritical = gap.status?.toLowerCase() === 'critical' || gap.status?.toLowerCase() === 'required';
          const badgeVariant = isCritical ? 'bad' : 'warn';

          return (
            <div
              key={gap.id}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={badgeVariant} size="sm">
                    {gap.status?.toUpperCase() || 'RECOMMENDED'}
                  </Badge>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                    {gap.schemaType}
                  </span>
                </div>

                {gap.pageUrl && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    {gap.pageUrl}
                  </span>
                )}
              </div>

              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                {gap.details}
              </p>

              {/* Generated Fix / Schema Block */}
              {gap.generatedFix && (
                <div style={{ marginTop: '0.75rem' }}>
                  <Disclosure
                    title="Inspect validated JSON-LD schema draft"
                    badge="JSON-LD"
                  >
                    <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                        <CopyButton text={gap.generatedFix} />
                      </div>

                      {/* Warning callout if placeholders exist */}
                      {gap.hasPlaceholders && (
                        <div
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'var(--warn-bg)',
                            border: '1px solid var(--warn-border)',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.75rem',
                            color: 'var(--warn)',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                          <span>Contains placeholder values. Replace null/example fields with your real organization data.</span>
                        </div>
                      )}

                      <pre
                        style={{
                          margin: 0,
                          padding: '1rem',
                          background: 'var(--bg-sunken)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-xs)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          overflowX: 'auto',
                          maxHeight: '260px',
                          lineHeight: 1.5,
                          color: 'var(--text)',
                        }}
                      >
                        <code>{gap.generatedFix}</code>
                      </pre>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.35rem' }}>
                        Validate markup using the official Schema.org or Google Rich Results Test before publishing.
                      </div>
                    </div>
                  </Disclosure>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
