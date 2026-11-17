import React from 'react';
import '../src/tokens.css';

export const Provider = ({ children }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-page)',
        color: 'var(--color-text)',
        minHeight: '100vh',
        padding: 'var(--space-06)',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {children}
    </div>
  );
};

