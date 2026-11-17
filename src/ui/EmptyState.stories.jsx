import React from 'react';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

export const Default = () => (
  <EmptyState
    title="Журнал порожній"
    description="За поточну зміну подій не зареєстровано. Нові події з’являться автоматично."
  />
);

export const WithAction = () => (
  <EmptyState
    title="Нічого не знайдено"
    description="Жодна подія не відповідає вибраним умовам відбору. Змініть запит або скиньте фільтри."
    action={
      <Button variant="secondary" size="sm">
        Скинути фільтри
      </Button>
    }
  />
);

export const DataUnavailable = () => (
  <EmptyState
    title="Дані недоступні"
    description="Не вдалося отримати початковий перелік подій. Спробуйте оновити дані ще раз."
    action={
      <Button variant="secondary" size="sm">
        Оновити дані
      </Button>
    }
  />
);
