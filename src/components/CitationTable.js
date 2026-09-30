'use client';

import { Bot, Search, CheckCircle2, XCircle, AlertCircle, Quote } from 'lucide-react';

export default function CitationTable({ citations = [] }) {
  if (!citations || citations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
        <Bot size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
        <p>No citation queries probed yet. Add target keywords during audit creation to track AI grounding.</p>
      </div>
    );
  }

  const getEngineBadge = (engine) => {
    const e = (engine || '').toLowerCase();
    let bg = 'hsla(200, 90%, 55%, 0.12)';
    let color = 'var(--accent-secondary)';
    let border = 'hsla(200, 90%, 55%, 0.3)';

    if (e.includes('chatgpt') || e.includes('openai')) {
      bg = 'hsla(155, 80%, 50%, 0.12)';
      color = 'var(--accent-primary)';
      border = 'hsla(155, 80%, 50%, 0.3)';
    } else if (e.includes('claude') || e.includes('anthropic')) {
      bg = 'hsla(270, 75%, 60%, 0.12)';
      color = 'var(--accent-purple)';
      border = 'hsla(270, 75%, 60%, 0.3)';
    }

    return (
      <span 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          background: bg,
          border: `1px solid ${border}`,
          color,
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)'
        }}
      >
        <Bot size={12} />
        {engine || 'Perplexity'}
      </span>
    );
  };

  const renderStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'cited') {
      return (
        <span 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.35rem',
            padding: '0.2rem 0.55rem', 
            borderRadius: 'var(--radius-full)',
            background: 'hsla(155, 80%, 50%, 0.15)',
            border: '1px solid hsla(155, 80%, 50%, 0.35)',
            color: 'var(--accent-primary)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
        >
          <CheckCircle2 size={13} />
          Cited
        </span>
      );
    }
    return (
      <span 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.35rem',
          padding: '0.2rem 0.55rem', 
          borderRadius: 'var(--radius-full)',
          background: 'hsla(0, 85%, 60%, 0.12)',
          border: '1px solid hsla(0, 85%, 60%, 0.3)',
          color: 'var(--accent-danger)',
          fontSize: '0.75rem',
          fontWeight: 600
        }}
      >
        <XCircle size={13} />
        Not Cited
      </span>
    );
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: 'linear-gradient(145deg, hsla(225, 25%, 12%, 0.6), hsla(225, 25%, 8%, 0.8))' }}>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'hsla(225, 25%, 10%, 0.8)', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
            <th style={{ padding: '0.85rem 1rem' }}>Query Keyword</th>
            <th style={{ padding: '0.85rem 1rem' }}>AI Engine</th>
            <th style={{ padding: '0.85rem 1rem' }}>Citation Status</th>
            <th style={{ padding: '0.85rem 1rem' }}>Extracted Citation Context</th>
            <th style={{ padding: '0.85rem 1rem' }}>Competitor Sources Cited</th>
          </tr>
        </thead>
        <tbody>
          {citations.map((citation, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
              <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <span>{citation.keyword}</span>
                </div>
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                {getEngineBadge(citation.engine)}
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                {renderStatus(citation.status)}
              </td>
              <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: 1.4 }}>
                {citation.citationContext ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', background: 'hsla(225, 25%, 8%, 0.6)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    <Quote size={13} style={{ color: 'var(--accent-secondary)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.78rem', fontStyle: 'italic' }}>{citation.citationContext}</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No citation snippet</span>
                )}
              </td>
              <td style={{ padding: '0.85rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                {citation.competitorsCited && citation.competitorsCited.length > 0 
                  ? citation.competitorsCited.join(', ') 
                  : 'None detected'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
