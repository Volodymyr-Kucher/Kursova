import React from 'react';
import { InlineNotification } from './InlineNotification';

export const Error = () => (
  <InlineNotification
    status="danger"
    title="Втрачено зв'язок із SENTINEL stream"
    description="Дані на екрані зафіксовані станом на 14:02:11 UTC. Нові цілі тимчасово не надходять."
    icon={
      <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--color-danger)">
        <path d="M10 2L1 18h18L10 2zm0 3.5L16.5 16H3.5L10 5.5zM9 9v3h2V9H9zm0 4v2h2v-2H9z" />
      </svg>
    }
  />
);

export const Warning = () => (
  <InlineNotification
    status="warning"
    title="Затримка оновлення каналу спостереження"
    description="Сенсор Ольвія працює в автономному буфері. Дані можуть надходити із запізненням до 30с."
    icon={
      <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--color-warning)">
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V6h2v4z" />
      </svg>
    }
  />
);

export const Success = () => (
  <InlineNotification
    status="success"
    title="Ціль trk-0042 успішно підтверджено"
    description="Оператор перевів запис у статус 'Призначено'. Дані синхронізовано з КП."
    icon={
      <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--color-success)">
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 11.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.1-5.1 1.4 1.4-6.5 6.5z" />
      </svg>
    }
  />
);

export const Info = () => (
  <InlineNotification
    status="info"
    title="Оновлення геометрії зон"
    description="Сектор Alpha-2 розширено відповідно до наказу чергового офіцера."
  />
);

