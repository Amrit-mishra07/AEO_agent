'use client';

import { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronUp, FileJson, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function SchemaGapList({ gaps = [] }) {
  const [expanded, setExpanded] = useState({});
  const [copied, setCopied] = useState({});
  const toast = useToast();

  const toggleExpand = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopy = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [index]: true }));
    toast.success('JSON-LD schema copied to clipboard');
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const formatFixCode = (fix) => {
    if (!fix) return '';
    if (typeof fix === 'object') {
      return fix.jsonLd || JSON.stringify(fix, null, 2);
    }
    try {
      const parsed = JSON.parse(fix);
      if (parsed && parsed.jsonLd) {
        return parsed.jsonLd;
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return fix;
    }
  };

  if (!gaps || gaps.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-primary)' }}>
        <p style={{ fontWeight: 600 }}>✓ All expected Schema.org structured data types are present and valid.</p>
      </div>
    );
  }

  return (
    <div className="issue-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {gaps.map((gap, index) => {
        const fixCode = formatFixCode(gap.generatedFix);
        const isExpanded = !!expanded[index];
        const isMissing = (gap.status || '').toLowerCase() === 'missing';

        return (
          <div 
            key={index} 
            className="issue-item"
            style={{
              background: 'linear-gradient(145deg, hsla(225, 25%, 13%, 0.7), hsla(225, 25%, 9%, 0.85))',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span 
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem', 
                    borderRadius: 'var(--radius-full)', 
                    background: 'hsla(200, 90%, 55%, 0.12)',
                    border: '1px solid hsla(200, 90%, 55%, 0.3)',
                    color: 'var(--accent-secondary)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <Code2 size={13} />
                  {gap.schemaType}
                </span>

                <span 
                  style={{ 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: 'var(--radius-full)', 
                    background: isMissing ? 'hsla(0, 85%, 60%, 0.12)' : 'hsla(40, 95%, 55%, 0.12)',
                    border: `1px solid ${isMissing ? 'hsla(0, 85%, 60%, 0.3)' : 'hsla(40, 95%, 55%, 0.3)'}`,
                    color: isMissing ? 'var(--accent-danger)' : 'var(--accent-warning)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}
                >
                  {gap.status || 'Missing'}
                </span>
              </div>

              {gap.pageUrl && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {gap.pageUrl.replace(/^https?:\/\/[^/]+/i, '') || '/'}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0 0.75rem' }}>
              {gap.details}
            </p>

            {fixCode && (
              <div style={{ marginTop: '0.75rem' }}>
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm" 
                  onClick={() => toggleExpand(index)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
                >
                  <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
                  <span>{isExpanded ? 'Hide Auto-Generated JSON-LD' : 'Inspect Auto-Generated JSON-LD'}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isExpanded && (
                  <div className="code-studio" style={{ marginTop: '0.75rem' }}>
                    <div className="code-studio-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="code-window-dots">
                          <span className="dot dot-red" />
                          <span className="dot dot-yellow" />
                          <span className="dot dot-green" />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <FileJson size={13} />
                          schema-{gap.schemaType.toLowerCase()}.jsonld
                        </span>
                      </div>
                      <button 
                        type="button"
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleCopy(index, fixCode)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                      >
                        {copied[index] ? <Check size={12} style={{ color: 'var(--accent-primary)' }} /> : <Copy size={12} />}
                        <span>{copied[index] ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre style={{ margin: 0, padding: '1rem', background: 'transparent', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                      <code>{fixCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
