import React from 'react';
import { Panel } from './Panel';
import { Button } from './Button';

export const Default = () => (
  <Panel>
    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
      Вміст базової панелі спостереження.
    </p>
  </Panel>
);

export const WithHeader = () => (
  <Panel title="Сектор Alpha-4">
    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
      Активне чергування. 4 цілі у зоні відповідальності.
    </p>
  </Panel>
);

export const WithActions = () => (
  <Panel
    title="Контроль доступу"
    actions={
      <Button variant="primary" size="sm">
        Оновити
      </Button>
    }
  >
    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
      Сенсори працюють у штатному режимі.
    </p>
  </Panel>
);

export const Dense = () => (
  <Panel title="Компактний режим" dense>
    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
      Зменшені відступи для щільних екранів аналітика.
    </p>
  </Panel>
);

