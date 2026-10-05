'use client';

import React, { useState, useMemo } from 'react';
import Badge from '@/components/ui/Badge';
import CopyButton from '@/components/ui/CopyButton';
import Disclosure from '@/components/ui/Disclosure';
import { Search, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function SeoSection({ issues = [], pageMetaFixes = [] }) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    return {
      all: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
      metaFixes: pageMetaFixes.length,
    };
  }, [issues, pageMetaFixes]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (activeTab !== 'all' && activeTab !== 'meta' && issue.severity !== activeTab) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (issue.issue || '').toLowerCase().includes(q) ||
        (issue.category || '').toLowerCase().includes(q) ||
        (issue.pageUrl || '').toLowerCase().includes(q)
      );
    });
  }, [issues, activeTab, search]);

  return (
    <section id="seo-issues" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Technical SEO & Crawler Hygiene
          </h2>
          <Badge variant="subtle" size="sm">{issues.length} Issues</Badge>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-2)' }}>
          12 deterministic hygiene rules evaluating discoverability, viewport, canonicals, and heading structure.
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
        {/* Controls: Filter Pills + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('critical')}
              className={`btn btn-sm ${activeTab === 'critical' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Critical ({counts.critical})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('warning')}
              className={`btn btn-sm ${activeTab === 'warning' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Warnings ({counts.warning})
            </button>
            {counts.metaFixes > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('meta')}
                className={`btn btn-sm ${activeTab === 'meta' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Page Meta Fixes ({counts.metaFixes})
              </button>
            )}
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Filter issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '2rem', height: '32px', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {/* View: Deduplicated Meta Fixes Tab */}
        {activeTab === 'meta' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pageMetaFixes.map((pageMeta, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  {pageMeta.pageUrl}
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
                    <CopyButton text={JSON.stringify(pageMeta.fixes, null, 2)} />
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '0.85rem',
                      background: 'var(--bg-sunken)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      overflowX: 'auto',
                    }}
                  >
                    <code>{JSON.stringify(pageMeta.fixes, null, 2)}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
            <CheckCircle2 size={24} style={{ color: 'var(--good)', margin: '0 auto 0.5rem' }} />
            No issues matching the selected filter.
          </div>
        ) : (
          /* View: Issue List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredIssues.map((issue) => {
              const isCrit = issue.severity === 'critical';
              const isWarn = issue.severity === 'warning';
              const sevBadge = isCrit ? 'bad' : isWarn ? 'warn' : 'subtle';

              return (
                <div
                  key={issue.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Badge variant={sevBadge} size="sm">
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                        {issue.category}
                      </span>
                    </div>

                    {issue.pageUrl && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {issue.pageUrl}
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.925rem', fontWeight: 600, color: 'var(--text)' }}>
                    {issue.issue}
                  </h4>

                  {issue.fixSuggestion && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                      <strong style={{ color: 'var(--text)' }}>Fix recommendation: </strong>
                      {issue.fixSuggestion}
                    </div>
                  )}

                  {issue.generatedFix && (() => {
                    const fixCodeStr = typeof issue.generatedFix === 'string'
                      ? issue.generatedFix
                      : (issue.generatedFix?.htmlSnippet || JSON.stringify(issue.generatedFix, null, 2));

                    return (
                      <div style={{ marginTop: '0.65rem' }}>
                        <Disclosure title="View generated code draft" badge="HTML">
                          <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                            <div style={{ position: 'absolute', top: 6, right: 6 }}>
                              <CopyButton text={fixCodeStr} />
                            </div>
                            <pre style={{ margin: 0, padding: '0.75rem', background: 'var(--bg-sunken)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', overflowX: 'auto' }}>
                              <code>{fixCodeStr}</code>
                            </pre>
                          </div>
                        </Disclosure>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
