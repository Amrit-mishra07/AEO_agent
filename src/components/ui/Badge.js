import React from 'react';

/**
 * Universal Badge / Status Pill Primitive
 * @param {object} props
 * @param {'good' | 'warn' | 'bad' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'} [props.variant='neutral']
 * @param {boolean} [props.dot=false]
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className='']
 * @param {React.ReactNode} props.children
 */
export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
  children,
  ...rest
}) {
  const normalizedVariant = {
    good: 'badge-success',
    success: 'badge-success',
    warn: 'badge-warning',
    warning: 'badge-warning',
    bad: 'badge-danger',
    danger: 'badge-danger',
    info: 'badge-info',
    brand: 'badge-info',
    subtle: '',
    neutral: '',
  }[variant] || '';

  const sizeClass = size === 'sm' ? 'badge-sm' : '';

  return (
    <span className={`badge ${normalizedVariant} ${sizeClass} ${className}`.trim()} {...rest}>
      {dot && <span className="live-status-dot" aria-hidden="true" />}
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export function StatusPill(props) {
  return <Badge {...props} />;
}
