'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CopyButton from '@/components/ui/CopyButton';
import { FileText, Download, Info } from 'lucide-react';

export default function LlmsTxtSection({ content = '' }) {
  const handleDownload = () => {
    if (typeof window === 'undefined' || !content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'llms.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!content) {
    return (
      <section id="llmstxt" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Engine Knowledge Protocol: /llms.txt
          </h2>
        </div>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>
            No /llms.txt file was generated for this audit.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="llmstxt" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Engine Knowledge Protocol: /llms.txt
          </h2>
          <Badge variant="brand" size="sm">Standard /llms.txt</Badge>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Curated, lightweight markdown index that tells AI agents and web crawlers which documentation pages to prioritize.
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
            /llms.txt Preview
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CopyButton text={content} />
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleDownload}
            >
              Download llms.txt
            </Button>
          </div>
        </div>

        <pre
          style={{
            margin: 0,
            padding: '1.25rem',
            background: 'var(--bg-sunken)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: 'var(--text)',
            maxHeight: '350px',
            overflowY: 'auto',
          }}
        >
          <code>{content}</code>
        </pre>

        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
          <Info size={14} style={{ flexShrink: 0 }} />
          <span>Notice: /llms.txt is an emerging proposal for AI web crawlers. Deploying this file to your domain root provides an authoritative markdown map for AI parsers.</span>
        </div>
      </div>
    </section>
  );
}
