import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function MethodologyNote() {
  return (
    <section id="methodology-note" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            Transparent Audit Methodology
          </h3>
        </div>

        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: '85ch' }}>
          AEO Agent evaluates your website through four distinct diagnostic vectors without vanity metrics or fabricated ranking claims.
          Scores are mathematically computed based on deterministic checks (12 technical rules and Schema.org entity coverage) paired with
          probabilistic LLM evaluations (6 content extractability dimensions) and live empirical citation probes via Gemini with Google Search Grounding.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
          <div>
            <strong style={{ color: 'var(--text)' }}>Technical SEO (30%)</strong>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-3)' }}>12 crawler hygiene rules: title, canonicals, viewport, H1 count, word count, and image alt text.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Schema Markup (25%)</strong>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-3)' }}>Knowledge graph validation for Organization, Article, and FAQPage structured entities.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Content Extractability (25%)</strong>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-3)' }}>6-dimension LLM rubric scoring answerability, definitions, facts, and structure.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>AI Citation Rate (20%)</strong>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-3)' }}>Empirical query testing against Gemini 2.5 with Google Search Grounding (up to 5 queries).</p>
          </div>
        </div>

        <Link
          href="/methodology"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--accent)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            textDecoration: 'none',
          }}
        >
          <span>Read complete methodology specification</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
