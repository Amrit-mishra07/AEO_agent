'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ArrowRight, Tag, X, Sparkles, Loader2, Zap } from 'lucide-react';

const PRESETS = [
  { label: 'Stripe', url: 'https://stripe.com', keywords: ['payment gateway', 'billing api'] },
  { label: 'Vercel', url: 'https://vercel.com', keywords: ['frontend cloud', 'next.js hosting'] },
  { label: 'Linear', url: 'https://linear.app', keywords: ['issue tracking', 'product management'] },
  { label: 'Supabase', url: 'https://supabase.com', keywords: ['postgres database', 'backend as a service'] },
];

export default function AuditForm() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^,+|,+$/g, '');
      if (tag && keywords.length < 10 && !keywords.includes(tag)) {
        setKeywords([...keywords, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setKeywords(keywords.filter(t => t !== tagToRemove));
  };

  const handleSelectPreset = (preset) => {
    setUrl(preset.url);
    setKeywords(preset.keywords);
    setError('');
  };

  const validateUrl = (urlString) => {
    try {
      const parsed = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let targetUrl = url.trim();
    if (!targetUrl) {
      setError('Please provide a website URL.');
      return;
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    if (!validateUrl(targetUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, keywords })
      });
      
      if (!res.ok) throw new Error('Audit failed to start');
      
      const data = await res.json();
      router.push(`/audit/${data.id}`);
    } catch (err) {
      setError(err.message || 'An error occurred during submission.');
      setIsLoading(false);
    }
  };

  return (
    <div className="cmd-bar-wrapper">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="cmd-bar">
          <div className="cmd-prefix">
            <Globe size={15} style={{ color: 'var(--accent-secondary)' }} />
            <span>https://</span>
          </div>
          <input
            type="text"
            className="cmd-input"
            placeholder="example.com or subpage..."
            value={url.replace(/^https?:\/\//i, '')}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <span>Run Audit</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="form-hint" style={{ color: 'var(--accent-danger)', textAlign: 'center', margin: 0 }}>
            {error}
          </p>
        )}

        {/* Quick Presets */}
        <div className="preset-container">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={13} style={{ color: 'var(--accent-warning)' }} />
            Quick Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="preset-btn"
              onClick={() => handleSelectPreset(preset)}
              disabled={isLoading}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Optional Keywords / Questions */}
        <div style={{ background: 'hsla(225, 20%, 12%, 0.5)', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Tag size={13} />
              Target Questions / Citation Queries (Optional)
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {keywords.length}/10
            </span>
          </div>

          <div className="tags-container" style={{ minHeight: '40px', padding: '0.35rem 0.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {keywords.map(tag => (
              <span key={tag} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}>
                {tag}
                <button 
                  type="button" 
                  className="tag-remove" 
                  onClick={() => removeTag(tag)} 
                  disabled={isLoading}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              className="tags-input"
              placeholder={keywords.length < 10 ? "Add question & press Enter..." : "Max keywords reached"}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              disabled={isLoading || keywords.length >= 10}
              style={{ fontSize: '0.82rem' }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
