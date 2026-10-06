import React from 'react';

/**
 * Universal Skeleton Loader Primitive
 * @param {object} props
 * @param {'text' | 'title' | 'card' | 'circle' | 'custom'} [props.type='text']
 * @param {string | number} [props.width]
 * @param {string | number} [props.height]
 * @param {string} [props.className='']
 * @param {object} [props.style]
 */
export default function Skeleton({
  type = 'text',
  width,
  height,
  radius,
  className = '',
  style = {},
  ...rest
}) {
  const typeClass = type === 'text'
    ? 'skeleton-text'
    : type === 'title'
    ? 'skeleton-title'
    : type === 'card'
    ? 'skeleton-card'
    : '';

  return (
    <div
      className={`skeleton ${typeClass} ${className}`.trim()}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
        borderRadius: radius !== undefined ? radius : (type === 'circle' ? '50%' : undefined),
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  );
}
