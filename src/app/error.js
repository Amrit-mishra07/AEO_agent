'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('App Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="container page-content" style={{ maxWidth: '640px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '3rem 2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-full)',
            background: 'var(--bad-bg)',
            border: '1px solid var(--bad-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--bad)',
          }}
        >
          <AlertTriangle size={24} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Application Error
        </h1>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
          An unexpected error occurred while rendering this view. Your audit data remains safely stored in the local database.
        </p>

        {error?.message && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-3)',
              marginBottom: '2rem',
              textAlign: 'left',
              wordBreak: 'break-all',
            }}
          >
            {error.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" icon={RotateCcw} onClick={() => reset()}>
            Try Again
          </Button>
          <Button as={Link} href="/" variant="secondary" icon={Home}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
