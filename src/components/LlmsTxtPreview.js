'use client';
import { useState } from 'react';

export default function LlmsTxtPreview({ content = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'llms.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="llmstxt-preview">
      <div className="llmstxt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="llmstxt-filename" style={{ fontWeight: 'bold' }}>llms.txt</span>
        <div className="llmstxt-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="copy-btn btn-sm btn" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="btn-sm btn" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
      <div className="llmstxt-content" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
        <pre style={{ margin: 0 }}>{content}</pre>
      </div>
    </div>
  );
}
