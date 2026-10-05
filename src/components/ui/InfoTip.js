'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

/**
 * Click- and Focus-Activated InfoTip Popover
 * Works on touch screens, mouse, and keyboard. Not hover-only.
 * @param {object} props
 * @param {React.ReactNode} props.content - Explanation text/nodes
 * @param {string} [props.label='More information']
 * @param {number} [props.size=14]
 */
export default function InfoTip({ content, label = 'More information', size = 14 }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={label}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: isOpen ? 'var(--accent)' : 'var(--text-3)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'color var(--transition-fast)',
        }}
      >
        <HelpCircle size={size} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={label}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'max-content',
            maxWidth: '280px',
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            padding: '0.65rem 0.85rem',
            fontSize: '0.8125rem',
            lineHeight: 1.45,
            zIndex: 200,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>{content}</div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-3)',
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
              }}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
