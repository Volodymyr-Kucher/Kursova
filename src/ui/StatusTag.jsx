import React from 'react';
import './ui.css';

const DEFAULT_LABELS = {
  unacknowledged: 'Unacknowledged',
  acknowledged: 'Acknowledged',
  assigned: 'Assigned',
  collecting: 'Collecting',
  done: 'Done',
};

export const StatusTag = ({
  status = 'acknowledged', // 'unacknowledged' | 'acknowledged' | 'assigned' | 'collecting' | 'done'
  children,
  className = '',
  ...props
}) => {
  const label = children || DEFAULT_LABELS[status] || status;
  return (
    <span
      role="status"
      className={`argus-tag argus-tag--${status} ${className}`.trim()}
      {...props}
    >
      {label}
    </span>
  );
};

