'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditForm() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && keywords.length < 10 && !keywords.includes(tag)) {
        setKeywords([...keywords, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setKeywords(keywords.filter(t => t !== tagToRemove));
  };

  const validateUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, keywords })
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
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="url">Target URL</label>
          <input
            id="url"
            type="url"
            className="form-input form-input-lg"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={isLoading}
          />
          {error && <p className="form-hint" style={{ color: 'var(--accent-danger)' }}>{error}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Keywords / Questions (Max 10)</label>
          <div className="tags-container">
            {keywords.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button 
                  type="button" 
                  className="tag-remove" 
                  onClick={() => removeTag(tag)} 
                  disabled={isLoading}
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              className="tags-input"
              placeholder={keywords.length < 10 ? "Type and press Enter" : "Maximum 10 keywords reached"}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              disabled={isLoading || keywords.length >= 10}
            />
          </div>
          <p className="form-hint">Press Enter to add keywords.</p>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
          {isLoading ? 'Starting Audit...' : 'Run Audit'}
        </button>
      </form>
    </div>
  );
}
