import React from 'react';
import './ui.css';

const DEFAULT_LABELS = {
  critical: 'Critical',
  high: 'High',
  warning: 'Warning',
  medium: 'Medium',
  info: 'Info',
  low: 'Low',
};

// Рівні з сервера (critical, warning, info) зводяться до трьох груп,
// щоб колірна і текстова ознаки завжди збігалися (В-2).
const LEVEL_ALIASES = {
  critical: 'high',
  warning: 'medium',
  info: 'low',
};

export const Severity = ({
  level = 'medium', // 'critical' | 'high' | 'warning' | 'medium' | 'info' | 'low'
  children,
  className = '',
  ...props
}) => {
  const label = children || DEFAULT_LABELS[level] || level;
  const modifier = LEVEL_ALIASES[level] || level;
  return (
    <span
      className={`argus-severity argus-severity--${modifier} ${className}`.trim()}
      {...props}
    >
      <span className="argus-severity__square" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
