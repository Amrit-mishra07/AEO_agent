'use client';

import { Globe, Lightbulb, CheckCircle2, Layers, AlertCircle } from 'lucide-react';

const DIMENSION_INFO = {
  firstSentenceAnswerability: 'Does the lead sentence directly answer common search intents?',
  definitionClarity: 'Are key technical entities and concepts explicitly defined?',
  factSpecificity: 'Are statements grounded with concrete, verifiable metrics and dates?',
  scannableStructure: 'Does the page leverage hierarchical H2/H3 headers, bullet points, and tables?',
  faqPresence: 'Is there a structured Q&A / FAQ section suitable for conversational extraction?',
  citationReadiness: 'Can an AI engine extract a concise 2-3 sentence self-contained citation?',
};

export default function ContentScoreCard({ pageScore }) {
  if (!pageScore) return null;

  const { url, scores = {}, overallPageScore = 0, feedback, suggestedImprovements = [] } = pageScore;

  const getColor = (val) => {
    const v = val || 0;
    if (v >= 80) return { bar: '#10b981', text: 'var(--accent-primary)', bg: 'hsla(155, 80%, 50%, 0.12)' };
    if (v >= 60) return { bar: '#f59e0b', text: 'var(--accent-warning)', bg: 'hsla(40, 95%, 55%, 0.12)' };
    return { bar: '#ef4444', text: 'var(--accent-danger)', bg: 'hsla(0, 85%, 60%, 0.12)' };
  };

  const renderProgressBar = (key, label) => {
    const val = scores[key] || 0;
    const color = getColor(val);
    const desc = DIMENSION_INFO[key] || '';

    return (
      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {label}
            </span>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: '0.1rem 0 0' }}>
              {desc}
            </p>
          </div>
          <span 
            style={{ 
              fontSize: '0.82rem', 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 700, 
              color: color.text,
              background: color.bg,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            {val}/100
          </span>
        </div>

        <div style={{ height: '7px', background: 'hsla(225, 20%, 20%, 0.6)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${val}%`, 
              height: '100%', 
              background: color.bar, 
              borderRadius: 'var(--radius-full)',
              transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' 
            }} 
          />
        </div>
      </div>
    );
  };

  const overallColor = getColor(overallPageScore);

  return (
    <div 
      className="card-compact"
      style={{
        background: 'linear-gradient(145deg, hsla(225, 25%, 13%, 0.7), hsla(225, 25%, 9%, 0.85))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Globe size={16} style={{ color: 'var(--accent-secondary)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {url}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            AEO Extractability Analysis & LLM Ingestion Diagnostics
          </p>
        </div>

        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: overallColor.bg, 
            border: `1px solid ${overallColor.bar}40`,
            padding: '0.4rem 0.85rem', 
            borderRadius: 'var(--radius-lg)' 
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Extractability:</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: overallColor.text }}>
            {overallPageScore}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/100</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {renderProgressBar('firstSentenceAnswerability', 'Answerability')}
        {renderProgressBar('definitionClarity', 'Definition Clarity')}
        {renderProgressBar('factSpecificity', 'Fact Specificity')}
        {renderProgressBar('scannableStructure', 'Scannable Structure')}
        {renderProgressBar('faqPresence', 'FAQ Presence')}
        {renderProgressBar('citationReadiness', 'Citation Readiness')}
      </div>

      {feedback && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsla(225, 25%, 8%, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <strong style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Lightbulb size={14} />
            LLM Diagnostic Observations:
          </strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
            {typeof feedback === 'string' ? feedback : JSON.stringify(feedback, null, 2)}
          </p>
        </div>
      )}

      {suggestedImprovements && suggestedImprovements.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={14} />
            Recommended Improvements for LLM Discovery:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {suggestedImprovements.map((imp, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'baseline', 
                  gap: '0.5rem', 
                  fontSize: '0.82rem', 
                  color: 'var(--text-secondary)',
                  padding: '0.35rem 0.65rem',
                  background: 'hsla(225, 20%, 15%, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span>
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
