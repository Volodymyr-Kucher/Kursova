import React from 'react';
import './ui.css';

export const Button = ({
  variant = 'secondary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md',          // 'md' | 'sm'
  disabled = false,
  unavailable = false,
  icon,
  children,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const isActuallyDisabled = disabled || unavailable;
  const classes = [
    'argus-btn',
    `argus-btn--${variant}`,
    size === 'sm' ? 'argus-btn--sm' : '',
    unavailable ? 'argus-btn--unavailable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={isActuallyDisabled}
      onClick={isActuallyDisabled ? undefined : onClick}
      {...props}
    >
      <span>{children}</span>
      {icon && <span className="argus-btn__icon" aria-hidden="true">{icon}</span>}
    </button>
  );
};

