'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Accessible Disclosure Component
 * Built on native <details> with custom summary styling for full print and keyboard accessibility.
 * @param {object} props
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.badge]
 * @param {boolean} [props.defaultOpen=false]
 * @param {string} [props.className='']
 * @param {React.ReactNode} props.children
 */
export default function Disclosure({
  title,
  badge,
  defaultOpen = false,
  className = '',
  children,
  ...rest
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
      className={`disclosure-wrapper ${className}`.trim()}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
      {...rest}
    >
      <summary
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          cursor: 'pointer',
          listStyle: 'none',
          userSelect: 'none',
          background: 'var(--bg-subtle)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <ChevronRight
            size={16}
            style={{
              color: 'var(--text-3)',
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform var(--transition-fast)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>
        </div>

        {badge && <div>{badge}</div>}
      </summary>

      <div
        style={{
          padding: '0.85rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
        }}
      >
        {children}
      </div>
    </details>
  );
}
