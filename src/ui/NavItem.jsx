import React from 'react';
import './ui.css';

export const NavItem = ({
  label,
  count = null,
  active = false,
  href = '#',
  onClick,
  className = '',
  ...props
}) => {
  return (
    <a
      href={href}
      className={`argus-nav-item ${active ? 'is-active' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      <span>{label}</span>
      {count !== null && (
        <span className="argus-nav-item__count" aria-label={`${count} items`}>
          {count}
        </span>
      )}
    </a>
  );
};

