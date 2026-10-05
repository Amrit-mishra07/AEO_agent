'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Accessible, resilient Copy Button
 * Uses navigator.clipboard with fallback to textarea selection.
 * @param {object} props
 * @param {string} props.text - The text to copy
 * @param {string} [props.label='Copy'] - Idle label
 * @param {string} [props.copiedLabel='Copied'] - Success label
 * @param {boolean} [props.iconOnly=false]
 * @param {'sm' | 'md'} [props.size='sm']
 * @param {string} [props.className='']
 * @param {() => void} [props.onCopySuccess]
 */
export default function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied',
  iconOnly = false,
  size = 'sm',
  className = '',
  onCopySuccess,
  ...rest
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    let success = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback method using temporary textarea
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setIsCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const currentLabel = isCopied ? copiedLabel : label;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`btn btn-secondary ${size === 'sm' ? 'btn-sm' : ''} ${className}`.trim()}
      aria-label={currentLabel}
      title={currentLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        color: isCopied ? 'var(--good)' : 'var(--text-2)',
        borderColor: isCopied ? 'var(--good-border)' : 'var(--border-strong)',
        backgroundColor: isCopied ? 'var(--good-bg)' : 'var(--bg)',
      }}
      {...rest}
    >
      {isCopied ? (
        <Check size={14} style={{ color: 'var(--good)' }} aria-hidden="true" />
      ) : (
        <Copy size={14} style={{ color: 'var(--text-2)' }} aria-hidden="true" />
      )}
      {!iconOnly && <span>{currentLabel}</span>}
      <span className="sr-only" aria-live="polite">
        {isCopied ? `${label} copied to clipboard` : ''}
      </span>
    </button>
  );
}
