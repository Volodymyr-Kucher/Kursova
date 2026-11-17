import React from 'react';
import './events.css';
import { formatClock } from './format';

// Рядок оперативних показників журналу (В-6).
export const EventsSummary = ({ counters, updatedAt, isOperator, filteredCount, totalCount }) => {
  const isFiltered = filteredCount !== totalCount;

  return (
    <div className="argus-events__summary">
      <div>
        Всього подій: <b>{counters.total}</b> · Відкритих: <b>{counters.open}</b> · Непідтверджених:{' '}
        <b className={counters.unack > 0 ? 'argus-events__summary-alert' : undefined}>
          {counters.unack}
        </b>
        {isFiltered && (
          <>
            {' · '}
            Показано за фільтром: <b>{filteredCount}</b>
          </>
        )}
        {!isOperator && (
          <span className="argus-events__mode">
            {' '}
            (роль analyst: масове підтвердження недоступне)
          </span>
        )}
      </div>

      <div className="argus-events__updated">
        {updatedAt ? `Оновлено: ${formatClock(updatedAt)}` : 'Очікування оновлення…'}
      </div>
    </div>
  );
};

export default EventsSummary;
