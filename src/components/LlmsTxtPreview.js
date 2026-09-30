'use client';

import { useState } from 'react';
import { FileText, Copy, Check, Download } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function LlmsTxtPreview({ content = '' }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('llms.txt content copied to clipboard');
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
    toast.success('llms.txt file downloaded');
  };

  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div className="code-studio">
      <div className="code-studio-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="code-window-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <FileText size={14} style={{ color: 'var(--accent-warning)' }} />
            /llms.txt
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            ({lineCount} lines)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button 
            type="button"
            className="btn btn-secondary btn-sm" 
            onClick={handleCopy}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
          >
            {copied ? <Check size={13} style={{ color: 'var(--accent-primary)' }} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button 
            type="button"
            className="btn btn-secondary btn-sm" 
            onClick={handleDownload}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
          >
            <Download size={13} />
            <span>Download</span>
          </button>
        </div>
      </div>
      <div style={{ padding: '1.25rem', background: 'hsl(225, 25%, 7%)', overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
        <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <code>{content || '# No llms.txt generated yet.'}</code>
        </pre>
      </div>
    </div>
  );
}
