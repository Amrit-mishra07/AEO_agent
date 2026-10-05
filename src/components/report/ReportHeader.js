'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ExternalLink, 
  RotateCcw, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  Globe 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LocalTime from '@/components/ui/LocalTime';
import { generatePlainTextSummary } from '@/view/summary';

export default function ReportHeader({ audit }) {
  const [copied, setCopied] = useState(false);

  const domain = audit?.domain || audit?.url || 'Report';
  const pageCount = audit?.pages?.length || 1;

  const handleCopySummary = async () => {
    try {
      const reportUrl = typeof window !== 'undefined' ? window.location.href : '';
      const text = generatePlainTextSummary(audit, reportUrl);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <header
      className="report-header"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.75rem',
        marginBottom: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        {/* Left Column: Domain, status, metadata */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <Badge variant="good" size="sm">
              <span className="live-status-dot" style={{ width: 6, height: 6 }} />
              Audit Complete
            </Badge>

            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-2)',
                background: 'var(--bg-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border)',
              }}
            >
              {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} Crawled
            </span>

            {audit?.completedAt && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} />
                <LocalTime timestamp={audit.completedAt} />
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0.25rem 0 0.5rem',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <span>{domain}</span>
            {audit?.url && (
              <a
                href={audit.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open audited site"
                style={{
                  color: 'var(--text-3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 4,
                  borderRadius: 'var(--radius-xs)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                <ExternalLink size={18} />
              </a>
            )}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-2)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
              {audit?.url}
            </span>
            {audit?.keywords && (
              <span>
                <strong style={{ color: 'var(--text-3)', fontWeight: 500 }}>Target Queries: </strong>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{audit.keywords}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopySummary}
          >
            {copied ? 'Summary Copied' : 'Copy Summary'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print PDF
          </Button>

          <Button
            as={Link}
            href="/"
            variant="primary"
            size="sm"
            icon={RotateCcw}
          >
            New Audit
          </Button>
        </div>
      </div>
    </header>
  );
}
