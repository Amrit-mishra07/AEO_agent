import React from 'react';
import Badge from '@/components/ui/Badge';
import { Globe, ArrowUpRight, AlertTriangle } from 'lucide-react';

export default function PagesSection({ pages = [] }) {
  if (!pages || pages.length === 0) {
    return null;
  }

  return (
    <section id="pages" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Crawled Surface & Architecture
          </h2>
          <Badge variant="subtle" size="sm">{pages.length} Endpoints</Badge>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Indexed endpoints and architectural boundaries evaluated during the diagnostic crawl (depth 1, up to 10 pages).
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pages.map((page, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 240, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  {page.statusCode ? (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)',
                        background: page.statusCode >= 400 ? 'var(--bad-bg)' : 'var(--bg-sunken)',
                        color: page.statusCode >= 400 ? 'var(--bad)' : 'var(--text-2)',
                        fontWeight: 600,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {page.statusCode}
                    </span>
                  ) : null}

                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                    {page.title || 'Untitled Page'}
                  </h3>

                  {page.isSpa && (
                    <Badge variant="warn" size="sm">
                      Client-Side SPA
                    </Badge>
                  )}
                </div>

                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  {page.url}
                </p>
              </div>

              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
              >
                <span>Visit</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
