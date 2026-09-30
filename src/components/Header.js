import Link from 'next/link';
import { Compass, BookOpen, Sparkles, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-logo">
          <div className="header-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} />
          </div>
          <span>AEO<span style={{ color: 'var(--accent-primary)', marginLeft: '2px' }}>Copilot</span></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div 
            className="status-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'hsla(155, 80%, 50%, 0.08)',
              border: '1px solid hsla(155, 80%, 50%, 0.25)',
              fontSize: '0.72rem',
              fontWeight: 500,
              color: 'var(--accent-primary)',
            }}
          >
            <span 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                boxShadow: '0 0 8px var(--accent-primary)',
              }}
            />
            <span>Gemini AI Connected</span>
          </div>

          <nav className="header-nav">
            <Link href="/" className="header-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Compass size={15} />
              <span>Dashboard</span>
            </Link>
            <a 
              href="https://schema.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="header-nav-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <BookOpen size={15} />
              <span>Schema Spec</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
