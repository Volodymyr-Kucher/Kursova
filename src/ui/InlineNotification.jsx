import React from 'react';
import './ui.css';

export const InlineNotification = ({
  status = 'danger', // 'danger' | 'warning' | 'success' | 'info'
  title,
  description,
  icon,
  className = '',
  ...props
}) => {
  const isAlert = status === 'danger';
  const role = isAlert ? 'alert' : 'status';

  return (
    <aside
      role={role}
      className={`argus-notification argus-notification--${status} ${className}`.trim()}
      {...props}
    >
      {icon && (
        <div style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="argus-notification__content">
        {title && <h3 className="argus-notification__title">{title}</h3>}
        {description && <p className="argus-notification__desc">{description}</p>}
      </div>
    </aside>
  );
};

