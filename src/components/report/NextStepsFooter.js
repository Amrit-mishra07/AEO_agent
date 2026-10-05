'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp, RotateCcw, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NextStepsFooter() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text)' }}>
        Recommended Next Steps
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* For Marketing Leads */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            For Content Strategists & Marketers
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            <li>Share the executive summary with leadership or clients via Copy Summary.</li>
            <li>Incorporate the Top Priority Fixes into your content editorial calendar.</li>
            <li>Restructure introductory copy on key landing pages to provide direct definitions in the first sentence.</li>
          </ul>
        </div>

        {/* For Developers */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            For Developers & Technical SEOs
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            <li>Copy and validate the generated JSON-LD Schema.org blocks into your page templates.</li>
            <li>Fix missing canonical tags and viewport tags on all crawled routes.</li>
            <li>Deploy the generated <code style={{ fontFamily: 'var(--font-mono)' }}>/llms.txt</code> index to your production root.</li>
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
        <Button as={Link} href="/" variant="primary" icon={RotateCcw}>
          Run Another Audit
        </Button>

        <Button variant="ghost" icon={ArrowUp} onClick={scrollToTop}>
          Back to Top
        </Button>
      </div>
    </footer>
  );
}
