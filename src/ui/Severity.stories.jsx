import React from 'react';
import { Severity } from './Severity';

export const AllSeverities = () => (
  <div style={{ display: 'flex', gap: 'var(--space-06)', alignItems: 'center' }}>
    <Severity level="high" />
    <Severity level="medium" />
    <Severity level="low" />
  </div>
);

export const High = () => <Severity level="high" />;
export const Medium = () => <Severity level="medium" />;
export const Low = () => <Severity level="low" />;

export const UkrainianLabels = () => (
  <div style={{ display: 'flex', gap: 'var(--space-06)', alignItems: 'center' }}>
    <Severity level="high">Високий</Severity>
    <Severity level="medium">Середній</Severity>
    <Severity level="low">Низький</Severity>
  </div>
);

