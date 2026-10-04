'use client';

import { Bot, Search, CheckCircle2, XCircle, AlertCircle, Quote, ExternalLink, ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

export default function CitationTable({ citations = [] }) {
  if (!citations || citations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
        <Bot size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
        <p>No citation queries probed yet. Add target keywords during audit creation to track AI search grounding.</p>
      </div>
    );
  }

  const getEngineBadge = (engine) => {
    return (
      <span 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          background: 'hsla(200, 90%, 55%, 0.12)',
          border: '1px solid hsla(200, 90%, 55%, 0.3)',
          color: 'var(--accent-secondary)',
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)'
        }}
      >
        <Bot size={12} />
        {engine || 'Gemini'}
      </span>
    );
  };

  const renderCitationType = (type, sourceUrl) => {
    const t = (type || '').toLowerCase();
    if (t === 'grounded_citation' || t === 'cited') {
      return (
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
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
            Verified Source Link
          </span>
          {sourceUrl && (
            <a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--accent-secondary)', textDecoration: 'none' }}
            >
              <span>Cited URL</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      );
    }

    if (t === 'brand_mention' || t === 'mentioned') {
      return (
        <span 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.35rem',
            padding: '0.2rem 0.55rem', 
            borderRadius: 'var(--radius-full)',
            background: 'hsla(200, 90%, 55%, 0.12)',
            border: '1px solid hsla(200, 90%, 55%, 0.3)',
            color: 'var(--accent-secondary)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          <AlertCircle size={13} />
          Brand Mention Only
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

  const renderSentiment = (sentiment) => {
    const s = (sentiment || 'neutral').toLowerCase();
    if (s === 'recommended') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
          <ThumbsUp size={12} />
          Recommended
        </span>
      );
    }
    if (s === 'criticized') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-danger)', fontSize: '0.75rem', fontWeight: 600 }}>
          <ThumbsDown size={12} />
          Criticized
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
        <Minus size={12} />
        Neutral / Overview
      </span>
    );
  };

  const renderCompetitors = (competitors) => {
    let list = [];
    if (Array.isArray(competitors)) {
      list = competitors;
    } else if (typeof competitors === 'string') {
      try {
        if (competitors.startsWith('[')) {
          list = JSON.parse(competitors);
        } else if (competitors.includes(',')) {
          list = competitors.split(',').map(s => s.trim());
        } else if (competitors !== 'N/A' && competitors !== 'None detected') {
          list = [competitors];
        }
      } catch {
        list = competitors ? [competitors] : [];
      }
    }

    if (list.length === 0) {
      return <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>None detected</span>;
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {list.slice(0, 4).map((comp, idx) => (
          <span 
            key={idx}
            style={{
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              background: 'hsla(225, 20%, 15%, 0.7)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)'
            }}
          >
            {comp}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: 'linear-gradient(145deg, hsla(225, 25%, 12%, 0.6), hsla(225, 25%, 8%, 0.8))' }}>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'hsla(225, 25%, 10%, 0.8)', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
            <th style={{ padding: '0.85rem 1rem' }}>Query Keyword</th>
            <th style={{ padding: '0.85rem 1rem' }}>Search Engine</th>
            <th style={{ padding: '0.85rem 1rem' }}>Grounding Citation</th>
            <th style={{ padding: '0.85rem 1rem' }}>AI Sentiment</th>
            <th style={{ padding: '0.85rem 1rem' }}>Extracted Context</th>
            <th style={{ padding: '0.85rem 1rem' }}>Discovered Competitors</th>
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
                {renderCitationType(citation.citationType || citation.status, citation.sourceUrl || citation.source_url)}
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                {renderSentiment(citation.sentiment)}
              </td>
              <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.4 }}>
                {citation.citationContext ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', background: 'hsla(225, 25%, 8%, 0.6)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    <Quote size={13} style={{ color: 'var(--accent-secondary)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.78rem', fontStyle: 'italic' }}>{citation.citationContext}</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No citation snippet</span>
                )}
              </td>
              <td style={{ padding: '0.85rem 1rem' }}>
                {renderCompetitors(citation.competitors || citation.competitorsCited)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
