'use client';

import React, { useEffect, useState } from 'react';

export default function ReportNav({ counts = {} }) {
  const [activeId, setActiveId] = useState('summary');

  const navItems = [
    { id: 'summary', label: 'Summary' },
    { id: 'priority-fixes', label: 'Priority Fixes', count: counts.priorityFixes },
    { id: 'seo-issues', label: 'Technical SEO', count: counts.seo },
    { id: 'schemas', label: 'Schema Markup', count: counts.schemas },
    { id: 'extractability', label: 'Content Extractability', count: counts.content },
    { id: 'citations', label: 'Gemini Probes', count: counts.citations },
    { id: 'llmstxt', label: 'llms.txt' },
    { id: 'pages', label: 'Crawled Pages', count: counts.pages },
  ].filter(item => item.count === undefined || item.count > 0 || item.id === 'summary' || item.id === 'llmstxt');

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  const scrollTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Report section navigation"
      className="report-subnav"
      style={{
        position: 'sticky',
        top: 56,
        zIndex: 50,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2rem',
        padding: '0.5rem 0',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollTo(e, item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text-2)',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)',
                    background: isActive ? 'var(--accent)' : 'var(--bg-sunken)',
                    color: isActive ? '#ffffff' : 'var(--text-3)',
                    fontWeight: 600,
                  }}
                >
                  {item.count}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
