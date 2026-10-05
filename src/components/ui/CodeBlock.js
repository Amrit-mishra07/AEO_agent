'use client';

import React, { useState } from 'react';
import CopyButton from './CopyButton';
import { WrapText } from 'lucide-react';

/**
 * Clean Monospace CodeBlock Component
 * @param {object} props
 * @param {string} props.code - The raw code content
 * @param {string} [props.language] - Optional language label (e.g. "json", "markdown")
 * @param {string} [props.filename] - Optional filename label (e.g. "schema.jsonld")
 * @param {boolean} [props.allowWrap=true]
 * @param {number} [props.maxHeight=400]
 * @param {string} [props.className='']
 */
export default function CodeBlock({
  code = '',
  language,
  filename,
  allowWrap = true,
  maxHeight = 400,
  className = '',
}) {
  const [isWrapped, setIsWrapped] = useState(false);

  return (
    <div className={`code-block ${className}`.trim()}>
      <div className="code-block-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          {filename && (
            <span style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
              {filename}
            </span>
          )}
          {language && (
            <span style={{ color: 'var(--text-3)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {language}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {allowWrap && (
            <button
              type="button"
              onClick={() => setIsWrapped(!isWrapped)}
              className="btn btn-ghost btn-sm"
              title={isWrapped ? 'Disable line wrap' : 'Enable line wrap'}
              aria-label={isWrapped ? 'Disable line wrap' : 'Enable line wrap'}
              style={{ padding: '0.25rem 0.45rem', fontSize: '0.75rem' }}
            >
              <WrapText size={13} style={{ color: isWrapped ? 'var(--accent)' : 'var(--text-3)' }} />
            </button>
          )}

          <CopyButton text={code} size="sm" />
        </div>
      </div>

      <pre
        style={{
          margin: 0,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: maxHeight ? 'auto' : undefined,
          whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
          wordBreak: isWrapped ? 'break-word' : 'normal',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
