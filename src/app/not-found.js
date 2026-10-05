import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container page-content" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
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
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--text-3)',
          }}
        >
          <Search size={24} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Page Not Found (404)
        </h1>
        <p style={{ margin: '0 0 2rem 0', fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
          The diagnostic report or page you requested does not exist or may have expired from local storage.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button as={Link} href="/" variant="primary" icon={Home}>
            Return to Console
          </Button>
          <Button as={Link} href="/demo" variant="secondary">
            View Demo Report
          </Button>
        </div>
      </div>
    </div>
  );
}
