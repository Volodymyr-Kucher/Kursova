import React from 'react';
import './layout.css';

const STREAM_STATES = {
  open: { modifier: 'open', label: 'Потік: онлайн' },
  connecting: { modifier: 'connecting', label: 'Потік: підключення' },
  closed: { modifier: 'closed', label: 'Потік: офлайн' },
  idle: { modifier: 'connecting', label: 'Потік: очікування' },
};

// Стан WebSocket-каналу. Стан передається і кольором, і текстом (В-7).
export const ConnectionBadge = ({ connection = 'idle', className = '', ...props }) => {
  const state = STREAM_STATES[connection] || STREAM_STATES.idle;

  return (
    <span
      className={`argus-stream argus-stream--${state.modifier} ${className}`.trim()}
      role="status"
      {...props}
    >
      <span className="argus-stream__dot" aria-hidden="true" />
      {state.label}
    </span>
  );
};

export default ConnectionBadge;
