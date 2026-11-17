import React from 'react';
import './events.css';
import { Panel } from '../../ui/Panel';
import { Button } from '../../ui/Button';
import { Severity } from '../../ui/Severity';
import { StatusTag } from '../../ui/StatusTag';
import { formatDateTime } from './format';

function DetailRow({ label, children }) {
  return (
    <>
      <dt className="argus-details__dt">{label}</dt>
      <dd className="argus-details__dd">{children}</dd>
    </>
  );
}

// Панель деталей обраної події: усі поля, які є в записі.
export const EventDetails = ({ event, onAck, onClose, canAck = true }) => {
  if (!event) {
    return (
      <Panel title="Деталі події" dense className="argus-events__details">
        <p className="argus-details__hint">
          Виберіть подію в журналі, щоб побачити її повні відомості: рівень, час, трек, зону та
          статус опрацювання.
        </p>
      </Panel>
    );
  }

  const isUnacknowledged = event.status === 'unacknowledged';

  return (
    <Panel title="Деталі події" dense className="argus-events__details">
      <dl className="argus-details__dl">
        <DetailRow label="Ідентифікатор">
          <span className="argus-mono">{event.id || '—'}</span>
        </DetailRow>
        <DetailRow label="Назва">{event.title || 'Без назви'}</DetailRow>
        <DetailRow label="Тип">
          <span className="argus-mono">{event.type || '—'}</span>
        </DetailRow>
        <DetailRow label="Рівень">
          <Severity level={event.severity || 'low'} />
        </DetailRow>
        <DetailRow label="Статус">
          <StatusTag status={event.status || 'unacknowledged'} />
        </DetailRow>
        <DetailRow label="Трек">
          <span className="argus-mono">{event.trackId || '—'}</span>
        </DetailRow>
        <DetailRow label="Зона">
          <span className="argus-mono">{event.zoneId || '—'}</span>
        </DetailRow>
        <DetailRow label="Час">{formatDateTime(event.ts)}</DetailRow>
      </dl>

      <div className="argus-details__actions">
        {isUnacknowledged && canAck && (
          <Button variant="primary" size="sm" onClick={() => onAck(event.id)}>
            Підтвердити
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClose}>
          Закрити
        </Button>
      </div>
    </Panel>
  );
};

export default EventDetails;
