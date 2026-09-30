'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, Search, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function IssueList({ issues = [] }) {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const toast = useToast();

  const counts = useMemo(() => {
    return {
      all: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const severityOrder = { critical: 1, warning: 2, info: 3 };
    return issues
      .filter(issue => {
        if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchIssue = (issue.issue || '').toLowerCase().includes(q);
          const matchDetails = (issue.details || '').toLowerCase().includes(q);
          const matchCategory = (issue.category || '').toLowerCase().includes(q);
          const matchUrl = (issue.pageUrl || '').toLowerCase().includes(q);
          return matchIssue || matchDetails || matchCategory || matchUrl;
        }
        return true;
      })
      .sort((a, b) => (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99));
  }, [issues, filterSeverity, searchQuery]);

  const handleCopyFix = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success('Suggested fix snippet copied');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!issues || issues.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-primary)' }}>
        <p style={{ fontWeight: 600 }}>✓ Zero SEO issues detected across audited pages.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls Bar: Filters + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem', background: 'hsla(225, 25%, 10%, 0.8)', padding: '0.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'critical', label: 'Critical', count: counts.critical, color: 'var(--accent-danger)' },
            { id: 'warning', label: 'Warning', count: counts.warning, color: 'var(--accent-warning)' },
            { id: 'info', label: 'Info', count: counts.info, color: 'var(--accent-secondary)' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterSeverity(tab.id)}
              style={{
                background: filterSeverity === tab.id ? 'hsla(225, 20%, 22%, 0.9)' : 'transparent',
                border: 'none',
                color: filterSeverity === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', background: 'hsla(225, 20%, 15%, 0.8)', color: tab.color || 'var(--text-secondary)' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search issues or URLs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.75rem 0.4rem 2.2rem',
              background: 'hsla(225, 25%, 10%, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          No issues match the selected filter.
        </p>
      ) : (
        <div className="issue-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredIssues.map((issue, idx) => {
            const isCrit = issue.severity === 'critical';
            const isWarn = issue.severity === 'warning';
            const fixText = typeof issue.generatedFix === 'string'
              ? issue.generatedFix
              : (issue.generatedFix ? JSON.stringify(issue.generatedFix, null, 2) : issue.fixSuggestion);

            return (
              <div 
                key={idx} 
                className={`issue-item issue-item-${issue.severity}`}
                style={{
                  background: 'linear-gradient(145deg, hsla(225, 25%, 13%, 0.7), hsla(225, 25%, 9%, 0.85))',
                  border: '1px solid var(--border-subtle)',
                  borderLeftWidth: '4px',
                  borderLeftColor: isCrit ? 'var(--accent-danger)' : isWarn ? 'var(--accent-warning)' : 'var(--accent-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isCrit ? (
                      <AlertCircle size={16} color="var(--accent-danger)" />
                    ) : isWarn ? (
                      <AlertTriangle size={16} color="var(--accent-warning)" />
                    ) : (
                      <Info size={16} color="var(--accent-secondary)" />
                    )}
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        fontSize: '0.72rem', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: isCrit ? 'var(--accent-danger)' : isWarn ? 'var(--accent-warning)' : 'var(--accent-secondary)'
                      }}
                    >
                      {issue.severity}
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'hsla(225, 20%, 20%, 0.5)', color: 'var(--text-tertiary)' }}>
                      {issue.category}
                    </span>
                  </div>

                  {issue.pageUrl && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {issue.pageUrl.replace(/^https?:\/\/[^/]+/i, '') || '/'}
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {issue.issue}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {issue.details}
                </p>

                {fixText && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'hsla(225, 25%, 8%, 0.8)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Suggested Fix:
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopyFix(idx, fixText)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedIndex === idx ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                          fontSize: '0.72rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {issue.fixSuggestion && issue.generatedFix && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        {issue.fixSuggestion}
                      </p>
                    )}

                    <pre style={{ margin: 0, padding: '0.5rem', background: 'hsla(0, 0%, 0%, 0.4)', borderRadius: '4px', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                      <code>{fixText}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
