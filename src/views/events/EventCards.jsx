import React from 'react';
import './events.css';
import { Severity } from '../../ui/Severity';
import { StatusTag } from '../../ui/StatusTag';
import { Button } from '../../ui/Button';
import { formatTime } from './format';

// Список подій картками для вузького екрана (375 px): таблиця там нечитабельна (В-1).
export const EventCards = ({ events = [], selectedId = null, onSelect, onAck, canAck = true }) => {
  if (events.length === 0) return null;

  return (
    <div className="argus-events__cards" aria-label="Список подій">
      {events.map((event) => {
        const isSelected = event.id === selectedId;
        return (
          <div
            key={event.id}
            className={`argus-event-card ${isSelected ? 'is-selected' : ''}`.trim()}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelect(event.id)}
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                keyEvent.preventDefault();
                onSelect(event.id);
              }
            }}
          >
            <div className="argus-event-card__top">
              <Severity level={event.severity || 'low'} />
              <StatusTag status={event.status || 'unacknowledged'} />
            </div>

            <span className="argus-event-card__title">
              {event.title || `Без назви (${event.id})`}
            </span>

            <div className="argus-event-card__meta">
              <span>{event.trackId || 'без треку'}</span>
              <span>{formatTime(event.ts)}</span>
            </div>

            {event.status === 'unacknowledged' && canAck && (
              <div className="argus-event-card__action">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    onAck(event.id);
                  }}
                >
                  Підтвердити
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EventCards;
