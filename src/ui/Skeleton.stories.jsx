import React from 'react';
import { Skeleton } from './Skeleton';

export const SingleBar = () => <Skeleton width="240px" />;

export const TextBlock = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-03)', maxWidth: 400 }}>
    <Skeleton width="100%" />
    <Skeleton width="85%" />
    <Skeleton width="60%" />
  </div>
);

export const CardSkeleton = () => (
  <div
    style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border-subtle)',
      padding: 'var(--space-05)',
      maxWidth: 320,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-04)',
    }}
  >
    <Skeleton width="45%" height="16px" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-03)' }}>
      <Skeleton width="100%" />
      <Skeleton width="90%" />
      <Skeleton width="70%" />
    </div>
  </div>
);

