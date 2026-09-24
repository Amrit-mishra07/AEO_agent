'use client';
import { useState } from 'react';

export default function SchemaGapList({ gaps = [] }) {
  const [expanded, setExpanded] = useState({});
  const [copied, setCopied] = useState({});

  const toggleExpand = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopy = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  if (!gaps || gaps.length === 0) {
    return <p>No schema gaps detected.</p>;
  }

  return (
    <div className="issue-list">
      {gaps.map((gap, index) => (
        <div key={index} className="issue-item">
          <div className="issue-header" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
              {gap.schemaType}
            </span>
            <span className={`badge badge-${gap.status.toLowerCase().replace(/\s+/g, '-')}`} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
              {gap.status}
            </span>
          </div>
          <p className="issue-url"><strong>URL:</strong> {gap.pageUrl}</p>
          <p className="issue-details">{gap.details}</p>

          {gap.generatedFix && (
            <div className="code-section" style={{ marginTop: '1rem' }}>
              <button className="btn btn-sm" onClick={() => toggleExpand(index)}>
                {expanded[index] ? 'Hide Suggested Fix' : 'View Suggested Fix'}
              </button>

              {expanded[index] && (
                <div className="code-block-wrapper" style={{ marginTop: '0.5rem' }}>
                  <div className="code-block-header">
                    <span>JSON-LD Fix</span>
                    <button className="copy-btn btn btn-sm" onClick={() => handleCopy(index, gap.generatedFix)}>
                      {copied[index] ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="code-block">
                    <code>{gap.generatedFix}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
