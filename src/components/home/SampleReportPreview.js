import React from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { ArrowUpRight } from 'lucide-react';

export default function SampleReportPreview() {
  return (
    <section aria-labelledby="sample-preview-title" style={{ marginTop: '3.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 id="sample-preview-title" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.015em' }}>
            What you get
          </h2>
          <p className="text-muted text-sm">
            Actionable executive diagnostics paired with developer-ready fixes.
          </p>
        </div>

        <Link
          href="/demo"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--accent)',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span>Open interactive demo</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div
        className="card"
        style={{
          padding: '1.5rem',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Sample Report Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                northwind-analytics.example
              </span>
              <Badge variant="neutral">Sample Data</Badge>
            </div>
            <p className="text-muted text-xs">
              Crawled 6 pages &bull; Probed 4 test queries with Gemini
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span
              className="tabular-nums"
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--warn)',
                lineHeight: 1,
              }}
            >
              74
            </span>
            <span className="text-muted text-xs">/100</span>
            <Badge variant="warn">C+</Badge>
          </div>
        </div>

        {/* 4 Pillars Preview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            margin: '1.25rem 0',
          }}
        >
          {[
            { label: 'Technical SEO', score: 88, variant: 'good' },
            { label: 'Structured Data', score: 65, variant: 'warn' },
            { label: 'Content Readiness', score: 78, variant: 'warn' },
            { label: 'AI Visibility', score: 60, variant: 'warn' },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                background: 'var(--bg-subtle)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span className="text-xs text-muted">{p.label}</span>
                <span className="tabular-nums text-xs" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {p.score}
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${p.score}%`,
                    height: '100%',
                    background: p.variant === 'good' ? 'var(--good)' : 'var(--warn)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Priority Fix Sample Row */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <Badge variant="bad">Critical</Badge>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Missing Organization & Article Schema</span>
            </div>
            <p className="text-muted text-xs">
              Affects 5 of 6 pages &bull; Auto-generated JSON-LD draft ready for review
            </p>
          </div>

          <Link href="/demo" className="btn btn-secondary btn-sm">
            <span>Inspect in Demo</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
