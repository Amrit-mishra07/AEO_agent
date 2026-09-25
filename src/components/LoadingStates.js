'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  'Crawling site...',
  'Analyzing SEO...',
  'Checking schemas...',
  'Scoring content...',
  'Probing AI citations...',
  'Generating fixes...',
];

export function AuditLoadingState({ auditId }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Animate through the loading steps for visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Poll the API every 3 seconds to check if the audit is done
  useEffect(() => {
    if (!auditId) return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/audit?id=${auditId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(poll);
          // Force a full page refresh so the server component re-reads the DB
          router.refresh();
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [auditId, router]);

  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <div className="loading-steps" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="loading-step"
            style={{
              opacity: i <= activeStep ? 1 : 0.35,
              transition: 'opacity 0.4s ease',
              fontWeight: i === activeStep ? '600' : '400',
              color: i < activeStep ? 'var(--accent-primary)' : undefined,
            }}
          >
            {i < activeStep ? '✓ ' : ''}{step}
          </div>
        ))}
      </div>
      <p style={{ marginTop: '2rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
        This may take 30–90 seconds depending on the site size.
      </p>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="report-skeleton">
      <div className="skeleton skeleton-title" style={{ width: '60%', height: '2rem', marginBottom: '1rem' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '40%', height: '1rem', marginBottom: '2rem' }}></div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
      </div>

      <div className="skeleton skeleton-card" style={{ width: '100%', height: '200px', borderRadius: '8px', marginBottom: '2rem' }}></div>
      <div className="skeleton skeleton-card" style={{ width: '100%', height: '200px', borderRadius: '8px' }}></div>
    </div>
  );
}
