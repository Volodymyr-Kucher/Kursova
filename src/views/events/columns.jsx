import React from 'react';
import { Severity } from '../../ui/Severity';
import { StatusTag } from '../../ui/StatusTag';
import { Button } from '../../ui/Button';
import { formatTime } from './format';

// Опис колонок таблиці подій. Винесений окремо, щоб EventsView лишався коротким.
export function buildColumns({ onAck, canAck = true }) {
  return [
    {
      key: 'severity',
      header: 'Рівень',
      width: '128px',
      render: (value) => <Severity level={value || 'low'} />,
    },
    {
      key: 'title',
      header: 'Подія',
      render: (value, row) => (
        <div>
          <span style={{ fontWeight: 500 }}>{value || `Без назви (${row.id})`}</span>
          {row.type && (
            <span className="argus-mono" style={{ display: 'block' }}>
              {row.type}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'trackId',
      header: 'Трек',
      width: '120px',
      render: (value) => <span className="argus-mono">{value || '—'}</span>,
    },
    {
      key: 'zoneId',
      header: 'Зона',
      width: '120px',
      render: (value) => <span className="argus-mono">{value || '—'}</span>,
    },
    {
      key: 'ts',
      header: 'Час (UTC)',
      width: '104px',
      render: (value) => <span className="argus-mono">{formatTime(value)}</span>,
    },
    {
      key: 'status',
      header: 'Статус',
      width: '160px',
      render: (value) => <StatusTag status={value || 'unacknowledged'} />,
    },
    {
      key: 'actions',
      header: 'Дія',
      width: '132px',
      render: (_, row) =>
        row.status === 'unacknowledged' && canAck ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onAck(row.id);
            }}
          >
            Підтвердити
          </Button>
        ) : (
          <span className="argus-mono">—</span>
        ),
    },
  ];
}
