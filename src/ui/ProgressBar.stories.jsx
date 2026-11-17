import React from 'react';
import { ProgressBar } from './ProgressBar';

export const TwentyFive = () => (
  <div style={{ maxWidth: 400 }}>
    <ProgressBar value={25} label="3 з 12 сенсорів підключено (25%)" />
  </div>
);

export const Fifty = () => (
  <div style={{ maxWidth: 400 }}>
    <ProgressBar value={50} label="Обробка первинних радіолокаційних відміток (50%)" />
  </div>
);

export const SeventyFive = () => (
  <div style={{ maxWidth: 400 }}>
    <ProgressBar value={75} label="Синхронізація треків сектору Північ (75%)" />
  </div>
);

export const Complete = () => (
  <div style={{ maxWidth: 400 }}>
    <ProgressBar value={100} label="Всі сенсори в мережі (100%)" />
  </div>
);

