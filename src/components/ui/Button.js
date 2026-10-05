import React from 'react';

/**
 * Universal Button Component
 * @param {object} props
 * @param {'button' | React.ComponentType} [props.as='button']
 * @param {'primary' | 'secondary' | 'ghost'} [props.variant='secondary']
 * @param {'sm' | 'md'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 * @param {React.ReactNode | React.ComponentType} [props.icon]
 * @param {'left' | 'right'} [props.iconPosition='left']
 * @param {string} [props.className='']
 * @param {React.ReactNode} [props.children]
 * @param {string} [props.ariaLabel]
 */
export default function Button({
  as: Component = 'button',
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  children,
  disabled,
  type = Component === 'button' ? 'button' : undefined,
  ariaLabel,
  ...rest
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  const isIconOnly = !children && (icon || isLoading);

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComp = icon;
      return <IconComp size={size === 'sm' ? 13 : 15} aria-hidden="true" />;
    }
    return null;
  };

  return (
    <Component
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${isIconOnly ? 'btn-icon' : ''} ${className}`.trim()}
      disabled={disabled || isLoading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <svg
          className="animate-spin"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      ) : icon && iconPosition === 'left' ? (
        <span className="btn-icon-wrapper" aria-hidden="true">{renderIcon()}</span>
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="btn-icon-wrapper" aria-hidden="true">{renderIcon()}</span>
      )}
    </Component>
  );
}
