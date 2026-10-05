import React from 'react';
import Link from 'next/link';
import AuditForm from '@/components/home/AuditForm';
import RecentAudits from '@/components/home/RecentAudits';
import HowItWorks from '@/components/home/HowItWorks';
import TrustSection from '@/components/home/TrustSection';
import SampleReportPreview from '@/components/home/SampleReportPreview';
import { listAudits } from '@/lib/db';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const audits = listAudits() || [];

  return (
    <div className="container page-content">
      {/* Above the Fold: Left-aligned Hero & Form */}
      <section style={{ maxWidth: '780px', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '0.85rem',
          }}
        >
          Does AI recommend your brand?
        </h1>

        <p
          className="lead"
          style={{
            fontSize: '1.0625rem',
            lineHeight: 1.55,
            color: 'var(--text-2)',
            marginBottom: '1.5rem',
          }}
        >
          Paste your website. AEO Agent checks how ready it is for AI answer engines, tests whether Gemini cites you today, and drafts the fixes.
        </p>

        <React.Suspense fallback={null}>
          <AuditForm />
        </React.Suspense>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="text-muted text-xs">Want to see the output first?</span>
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
            <span>Explore sample report</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 1. What you get: Real Report Preview */}
      <SampleReportPreview />

      {/* 2. How it works: 4-stage pipeline */}
      <HowItWorks />

      {/* 3. Why you can trust the numbers */}
      <TrustSection />

      {/* 4. Recent Audits Table */}
      <section aria-labelledby="recent-audits-heading" style={{ marginTop: '3.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 id="recent-audits-heading" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.015em' }}>
            Recent diagnostic runs
          </h2>
          <p className="text-muted text-sm">
            Past crawl reports and performance snapshots.
          </p>
        </div>

        <RecentAudits audits={audits} />
      </section>
    </div>
  );
}
