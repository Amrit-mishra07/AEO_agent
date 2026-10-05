'use client';

import React, { useState } from 'react';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';
import Disclosure from '@/components/ui/Disclosure';
import { FileEdit, Check, ArrowRight } from 'lucide-react';

export default function RewriteViewer({ rewrites = [] }) {
  if (!rewrites || rewrites.length === 0) {
    return null;
  }

  return (
    <section id="rewrites" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            AEO Content Rewrites
          </h2>
          <Badge variant="brand" size="sm">{rewrites.length} Drafts</Badge>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)' }}>
          LLM-generated structural revisions that turn informal marketing prose into extractable, declarative answers.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {rewrites.map((item, idx) => {
          let path = item.pageUrl || '';
          try {
            path = new URL(item.pageUrl).pathname || '/';
          } catch {
            // raw
          }

          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                    {path}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {item.pageUrl}
                  </div>
                </div>

                <Badge variant="subtle" size="sm">
                  Content Revision Draft
                </Badge>
              </div>

              {item.rationale && (
                <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '1rem', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--text)' }}>Revision strategy: </strong>
                  {item.rationale}
                </div>
              )}

              {/* Rewritten Content Code Block */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                  <CopyButton text={item.rewrittenContent || ''} />
                </div>

                <pre
                  style={{
                    margin: 0,
                    padding: '1rem',
                    background: 'var(--bg-sunken)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                    maxHeight: '260px',
                    overflowY: 'auto',
                    color: 'var(--text)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <code>{item.rewrittenContent}</code>
                </pre>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.4rem' }}>
                Notice: Draft content rewrite. Review for brand tone, voice, and accuracy before publishing.
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
