'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';
import Disclosure from '@/components/ui/Disclosure';
import { extractPriorityFixes } from '@/view/priority';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Bot, 
  Search,
  ExternalLink 
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Technical SEO': Search,
  'Schema Markup': Code2,
  'Content Extractability': Layers,
  'AI Visibility': Bot,
};

export default function PriorityFixes({ audit }) {
  const fixes = extractPriorityFixes(audit);

  if (!fixes || fixes.length === 0) {
    return (
      <section id="priority-fixes" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <CheckCircle2 size={32} style={{ color: 'var(--good)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text)' }}>
            No Critical Fixes Required
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)' }}>
            All audited pages passed essential crawler hygiene, schema, and content extractability checks.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="priority-fixes" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Top Priority Fixes
          </h2>
          <Badge variant="brand" size="sm">{fixes.length} Actions</Badge>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Ranked by direct impact on AI answer engine crawlability and entity knowledge extraction.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fixes.map((fix) => {
          const Icon = CATEGORY_ICONS[fix.category] || AlertTriangle;
          const severityVariant = fix.severity === 'critical' ? 'bad' : fix.severity === 'warning' ? 'warn' : 'subtle';

          return (
            <div
              key={fix.id}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Header: Rank, Category, Severity */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: 'var(--accent)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    #{fix.rank}
                  </span>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Icon size={14} style={{ color: 'var(--text-3)' }} />
                    {fix.category}
                  </span>
                </div>

                <Badge variant={severityVariant} size="sm">
                  {fix.severity.toUpperCase()}
                </Badge>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.4rem 0', color: 'var(--text)' }}>
                {fix.title}
              </h3>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                {fix.description}
              </p>

              {/* Impact Callout */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  borderLeft: '3px solid var(--accent)',
                  fontSize: '0.8rem',
                  color: 'var(--text-2)',
                  marginBottom: fix.codeSnippet ? '1rem' : 0,
                  lineHeight: 1.45,
                }}
              >
                <strong style={{ color: 'var(--text)' }}>Why AI cares: </strong>
                {fix.impact}
              </div>

              {/* Page URL reference if any */}
              {fix.pageUrl && (
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginBottom: fix.codeSnippet ? '0.75rem' : 0 }}>
                  Endpoint: {fix.pageUrl}
                </div>
              )}

              {/* Code Snippet Fix Draft */}
              {fix.codeSnippet && (() => {
                const snippetString = typeof fix.codeSnippet === 'string'
                  ? fix.codeSnippet
                  : (fix.codeSnippet?.htmlSnippet || JSON.stringify(fix.codeSnippet, null, 2));

                return (
                  <div style={{ marginTop: '0.75rem' }}>
                    <Disclosure
                      title="View generated remediation code"
                      badge="AI draft"
                    >
                      <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 2 }}>
                          <CopyButton text={snippetString} />
                        </div>
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
                            maxHeight: '220px',
                            lineHeight: 1.5,
                            color: 'var(--text)',
                          }}
                        >
                          <code>{snippetString}</code>
                        </pre>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>
                          Notice: AI-generated remediation draft. Test and validate before deploying to production.
                        </div>
                      </div>
                    </Disclosure>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </section>
  );
}
