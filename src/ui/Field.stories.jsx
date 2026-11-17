import React from 'react';
import { action } from '@ladle/react';
import { Field } from './Field';

export const Default = () => (
  <div style={{ maxWidth: 360 }}>
    <Field
      id="zone-name"
      label="Назва зони"
      placeholder="Наприклад: Північний кордон"
      onChange={action('input-change')}
    />
  </div>
);

export const WithValue = () => (
  <div style={{ maxWidth: 360 }}>
    <Field
      id="sector-code"
      label="Ідентифікатор сектора"
      defaultValue="SEC-0492"
      onChange={action('input-change')}
    />
  </div>
);

export const WithHelper = () => (
  <div style={{ maxWidth: 360 }}>
    <Field
      id="callsign"
      label="Позивний підрозділу"
      placeholder="Введіть 4-значний код"
      helper="Тільки латинські літери та цифри"
      onChange={action('input-change')}
    />
  </div>
);

export const WithError = () => (
  <div style={{ maxWidth: 360 }}>
    <Field
      id="azimuth"
      label="Азимут цілі"
      defaultValue="420"
      error="Вкажіть значення від 0 до 359 градусів"
      onChange={action('input-change')}
    />
  </div>
);

export const Disabled = () => (
  <div style={{ maxWidth: 360 }}>
    <Field
      id="system-id"
      label="Системний ключ (тільки читання)"
      defaultValue="SYS-ROOT-ARGUS-88"
      disabled
    />
  </div>
);

