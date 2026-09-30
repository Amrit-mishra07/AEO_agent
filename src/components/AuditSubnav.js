'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Code2, 
  Layers, 
  Bot, 
  FileText, 
  Globe 
} from 'lucide-react';

export default function AuditSubnav({ counts = {} }) {
  const [activeSection, setActiveSection] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'seo-issues', label: 'Technical SEO', count: counts.seo, icon: Search },
    { id: 'schemas', label: 'Schema Markup', count: counts.schemas, icon: Code2 },
    { id: 'extractability', label: 'Content Extractability', count: counts.content, icon: Layers },
    { id: 'citations', label: 'AI Citations', count: counts.citations, icon: Bot },
    { id: 'llmstxt', label: 'llms.txt Studio', icon: FileText },
    { id: 'pages', label: 'Crawled Pages', count: counts.pages, icon: Globe },
  ].filter(item => item.count === undefined || item.count > 0 || item.id === 'overview' || item.id === 'llmstxt');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(navItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offsetTop = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(id);
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <nav className="sticky-subnav">
      <div className="container sticky-subnav-inner">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              className={`subnav-btn ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" style={{ width: 14, height: 14 }} />
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span 
                  style={{ 
                    fontSize: '0.7rem', 
                    padding: '1px 6px', 
                    borderRadius: '10px', 
                    background: isActive ? 'var(--accent-primary-dim)' : 'var(--bg-tertiary)',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    fontWeight: 600
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
