import React from 'react';
import './ui.css';

export const ProgressBar = ({
  value = 0, // 0 to 100
  label,
  className = '',
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `${clampedValue}%`}
      className={`argus-progress ${className}`.trim()}
      {...props}
    >
      <div className="argus-progress__track">
        <div
          className="argus-progress__bar"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {label && <span className="argus-progress__text">{label}</span>}
    </div>
  );
};

