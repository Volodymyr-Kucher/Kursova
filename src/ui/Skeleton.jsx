import React from 'react';
import './ui.css';

export const Skeleton = ({
  width = '100%',
  height = '12px',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <span
      className={`argus-skeleton ${className}`.trim()}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

