import React from 'react';
import { StatusTag } from './StatusTag';

export const AllTags = () => (
  <div style={{ display: 'flex', gap: 'var(--space-04)', flexWrap: 'wrap' }}>
    <StatusTag status="unacknowledged" />
    <StatusTag status="acknowledged" />
    <StatusTag status="assigned" />
    <StatusTag status="collecting" />
    <StatusTag status="done" />
  </div>
);

export const Unacknowledged = () => <StatusTag status="unacknowledged" />;
export const Acknowledged = () => <StatusTag status="acknowledged" />;
export const Assigned = () => <StatusTag status="assigned" />;
export const Collecting = () => <StatusTag status="collecting" />;
export const Done = () => <StatusTag status="done" />;

export const CustomLabel = () => (
  <StatusTag status="unacknowledged">Нова подія (3)</StatusTag>
);

