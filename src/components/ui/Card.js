import React from 'react';

/**
 * Universal Flat Card Component
 * @param {object} props
 * @param {'div' | 'section' | 'article'} [props.as='div']
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.headerAction]
 * @param {React.ReactNode} [props.footer]
 * @param {boolean} [props.compact=false]
 * @param {string} [props.className='']
 * @param {React.ReactNode} props.children
 */
export default function Card({
  as: Component = 'div',
  title,
  subtitle,
  headerAction,
  footer,
  compact = false,
  className = '',
  children,
  ...rest
}) {
  const hasHeader = title || subtitle || headerAction;

  return (
    <Component className={`card ${compact ? 'card-compact' : ''} ${className}`.trim()} {...rest}>
      {hasHeader && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}

      <div className="card-body">{children}</div>

      {footer && <div className="card-footer" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>{footer}</div>}
    </Component>
  );
}
