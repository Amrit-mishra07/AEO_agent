'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { APP_NAME, REPO_URL } from '@/config/site';
import ThemeToggle from './ui/ThemeToggle';
import { Star, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setHealthStatus(data.status);
        }
      })
      .catch(() => {
        // Silently fallback if healthcheck fails
        if (isMounted) setHealthStatus('offline');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="header">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/" className="header-logo">
            <span>{APP_NAME}</span>
          </Link>

          {healthStatus === 'healthy' && (
            <span
              className="badge"
              style={{
                fontSize: '0.6875rem',
                padding: '0.15rem 0.45rem',
                color: 'var(--good)',
                backgroundColor: 'var(--good-bg)',
                borderColor: 'var(--good-border)',
              }}
              title="Gemini AI & Database operational"
            >
              <span className="live-status-dot" style={{ backgroundColor: 'var(--good)' }} />
              Ready
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav" aria-label="Main Navigation">
          <Link href="/demo" className="header-nav-link">
            Demo
          </Link>
          <Link href="/methodology" className="header-nav-link">
            Methodology
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="header-nav-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Star size={14} aria-hidden="true" />
            <span>GitHub</span>
          </a>

          <ThemeToggle />

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost btn-sm btn-icon"
            style={{ display: 'none' }}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </div>

      {/* Mobile dropdown if opened */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--bg)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Link
            href="/demo"
            className="header-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Demo
          </Link>
          <Link
            href="/methodology"
            className="header-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Methodology
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="header-nav-link"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Star size={14} />
            <span>GitHub</span>
          </a>
        </div>
      )}
    </header>
  );
}
