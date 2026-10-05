'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Globe, Plus, X, ArrowRight, AlertCircle } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'best payment API for startups',
  'how to deploy next.js with turbopack',
  'postgres database as a service',
  'issue tracking tool for modern engineering teams',
];

const PRESETS = [
  { label: 'stripe.com', url: 'https://stripe.com', queries: ['best payment API for startups'] },
  { label: 'vercel.com', url: 'https://vercel.com', queries: ['next.js hosting platform'] },
  { label: 'supabase.com', url: 'https://supabase.com', queries: ['open source firebase alternative'] },
  { label: 'linear.app', url: 'https://linear.app', queries: ['issue tracking for software teams'] },
];

export default function AuditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams?.get('url') || searchParams?.get('retry_url') || '';
  const initialQuestions = searchParams?.get('questions') || searchParams?.get('retry_questions') || '';

  const [url, setUrl] = useState(initialUrl);
  const [keywords, setKeywords] = useState(() => 
    initialQuestions ? initialQuestions.split(',').map(s => s.trim()).filter(Boolean) : []
  );
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);

  const addTag = (rawText) => {
    const trimmed = rawText.trim().replace(/^,+|,+$/g, '');
    if (!trimmed) return;
    if (keywords.length >= 10) return;
    if (!keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
    }
    setTagInput('');
    setError('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && keywords.length > 0) {
      e.preventDefault();
      setKeywords((prev) => prev.slice(0, -1));
    }
  };

  const handleTagPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const items = pasteData.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (items.length > 0) {
      setKeywords((prev) => {
        const next = [...prev];
        for (const item of items) {
          if (next.length < 10 && !next.includes(item)) {
            next.push(item);
          }
        }
        return next;
      });
      setTagInput('');
      setError('');
    }
  };

  const removeTag = (indexToRemove) => {
    setKeywords((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const applyPreset = (preset) => {
    setUrl(preset.url);
    setKeywords(preset.queries);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If there is text in the tag input, add it first
    if (tagInput.trim() && keywords.length < 10) {
      addTag(tagInput);
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a website URL.');
      return;
    }

    // Preserve protocol if user typed http:// or https://; otherwise prepend https://
    let targetUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      new URL(targetUrl);
    } catch {
      setError('Please enter a valid website address (e.g. yourcompany.com).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          keywords,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Audit failed to start.');
        setIsLoading(false);
        if (errorRef.current) errorRef.current.focus();
        return;
      }

      router.push(`/audit/${data.id}`);
    } catch (err) {
      setError(err.message || 'Network error communicating with the server. Please check your connection.');
      setIsLoading(false);
      if (errorRef.current) errorRef.current.focus();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        maxWidth: '680px',
      }}
    >
      {/* Field 1: Website URL */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="audit-url-input"
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '0.35rem',
            color: 'var(--text)',
          }}
        >
          Website address
        </label>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--text-3)',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-hidden="true"
          >
            <Globe size={16} />
          </span>

          <input
            id="audit-url-input"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="yourcompany.com"
            disabled={isLoading}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem 0.65rem 2.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-input)',
              color: 'var(--text)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
            aria-describedby="url-helper-text"
          />
        </div>

        <p
          id="url-helper-text"
          className="text-muted text-xs"
          style={{ marginTop: '0.35rem' }}
        >
          We crawl up to 10 pages and respect robots.txt.
        </p>
      </div>

      {/* Field 2: Questions customers ask AI (Optional) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
          <label
            htmlFor="query-tag-input"
            style={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--text)',
            }}
          >
            Questions customers ask AI <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optional)</span>
          </label>
          <span className="tabular-nums text-muted text-xs" aria-live="polite">
            {keywords.length} of 10
          </span>
        </div>

        {/* Tag Container */}
        <div
          style={{
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem 0.5rem',
            background: 'var(--bg-input)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            minHeight: '42px',
            alignItems: 'center',
          }}
        >
          {keywords.map((query, index) => (
            <span
              key={index}
              className="badge"
              style={{
                fontSize: '0.8125rem',
                padding: '0.2rem 0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                borderColor: 'var(--border)',
              }}
            >
              <span>{query}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                disabled={isLoading}
                aria-label={`Remove query "${query}"`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                }}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}

          <input
            id="query-tag-input"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onPaste={handleTagPaste}
            onBlur={() => {
              if (tagInput.trim()) addTag(tagInput);
            }}
            placeholder={
              keywords.length === 0
                ? 'e.g. best payment API for startups (press Enter)'
                : keywords.length < 10
                ? 'Add another question...'
                : 'Maximum 10 questions reached'
            }
            disabled={isLoading || keywords.length >= 10}
            style={{
              flex: 1,
              minWidth: '200px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '0.875rem',
              padding: '0.25rem',
            }}
            aria-describedby="query-helper-text"
          />
        </div>

        <p id="query-helper-text" className="text-muted text-xs" style={{ marginTop: '0.35rem' }}>
          Add up to 10 questions. Without these we skip the AI visibility test and score technical readiness only.
        </p>

        {/* Suggested Queries */}
        {keywords.length < 10 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className="text-muted text-xs">Suggestions:</span>
            {SUGGESTED_QUESTIONS.filter((q) => !keywords.includes(q)).slice(0, 2).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => addTag(q)}
                disabled={isLoading}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Plus size={11} aria-hidden="true" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Inline Server Error Banner */}
      {error && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bad-bg)',
            border: '1px solid var(--bad-border)',
            color: 'var(--bad)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
          <div>{error}</div>
        </div>
      )}

      {/* Primary Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          icon={<ArrowRight size={15} />}
          iconPosition="right"
          disabled={isLoading}
        >
          {isLoading ? 'Starting audit...' : 'Run audit'}
        </Button>

        {/* Small "Try an example" row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span className="text-muted text-xs">Try an example:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.1rem 0.35rem',
                fontSize: '0.75rem',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
