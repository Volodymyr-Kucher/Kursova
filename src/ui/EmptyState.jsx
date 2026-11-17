import React from 'react';
import './ui.css';

// Стан відсутності даних. Ніколи не замінює собою помилку завантаження.
export const EmptyState = ({ title, description, action, className = '', ...props }) => {
  return (
    <div className={`argus-empty ${className}`.trim()} role="status" {...props}>
      <span className="argus-empty__mark" aria-hidden="true" />
      <h3 className="argus-empty__title">{title}</h3>
      {description && <p className="argus-empty__desc">{description}</p>}
      {action && <div className="argus-empty__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
