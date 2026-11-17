import React from 'react';
import './ui.css';

export const Panel = ({
  title,
  actions,
  children,
  dense = false,
  className = '',
  ...props
}) => {
  return (
    <section
      className={`argus-panel ${dense ? 'argus-panel--dense' : ''} ${className}`.trim()}
      {...props}
    >
      {(title || actions) && (
        <header className="argus-panel__header">
          {title && <h2 className="argus-panel__title">{title}</h2>}
          {actions && <div className="argus-panel__actions">{actions}</div>}
        </header>
      )}
      <div className="argus-panel__body">{children}</div>
    </section>
  );
};

