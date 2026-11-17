import React from 'react';
import { action } from '@ladle/react';
import { Button } from './Button';

export const Primary = () => (
  <Button variant="primary" onClick={action('primary-click')}>
    Підтвердити
  </Button>
);

export const Secondary = () => (
  <Button variant="secondary" onClick={action('secondary-click')}>
    Скасувати
  </Button>
);

export const Ghost = () => (
  <Button variant="ghost" onClick={action('ghost-click')}>
    Деталі запису
  </Button>
);

export const Danger = () => (
  <Button variant="danger" onClick={action('danger-click')}>
    Видалити
  </Button>
);

export const Small = () => (
  <Button variant="secondary" size="sm" onClick={action('sm-click')}>
    Фільтр
  </Button>
);

export const Disabled = () => (
  <Button variant="primary" disabled>
    Підтвердити
  </Button>
);

export const Unavailable = () => (
  <Button variant="primary" unavailable title="Потрібні права оператора">
    Створити завдання (operator only)
  </Button>
);

export const WithIcon = () => (
  <Button
    variant="primary"
    onClick={action('icon-click')}
    icon={
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2l6 6-6 6-1.4-1.4L11.2 8 6.6 3.4 8 2z" />
      </svg>
    }
  >
    Призначити
  </Button>
);

