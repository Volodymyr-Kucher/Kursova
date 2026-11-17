import React, { useMemo, useState } from 'react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { DataTable } from '../ui/DataTable';
import { EmptyState } from '../ui/EmptyState';
import { InlineNotification } from '../ui/InlineNotification';
import {
  useEvents,
  useEventCounters,
  useEventsStatus,
  useEventActions,
} from '../hooks';
import { EventsSummary } from './events/EventsSummary';
import { EventsToolbar } from './events/EventsToolbar';
import { EventDetails } from './events/EventDetails';
import { EventCards } from './events/EventCards';
import { buildColumns } from './events/columns';
import { filterEvents, paginate, PAGE_SIZE } from './events/filters';
import './events/events.css';

const EMPTY_FILTERS = { query: '', severity: 'all', status: 'all' };

// Головне представлення підсистеми «Журнал подій».
// Має чотири стани: завантаження, помилка, відсутність даних і дані.
export const EventsView = ({ profile, connection = 'idle', caughtUp = 0 }) => {
  const events = useEvents();
  const counters = useEventCounters();
  const { status, error, updatedAt } = useEventsStatus();
  const { refresh, ack, ackAll } = useEventActions();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState(null);

  const isOperator = profile.role === 'operator';
  const isFiltered =
    filters.query !== '' || filters.severity !== 'all' || filters.status !== 'all';

  const filtered = useMemo(() => filterEvents(events, filters), [events, filters]);
  const { items: pageItems, page: currentPage, totalPages } = useMemo(
    () => paginate(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) || null,
    [events, selectedId]
  );

  const columns = useMemo(() => buildColumns({ onAck: ack, canAck: true }), [ack]);

  const applyFilter = (patch) => {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleAck = async (id) => {
    await ack(id);
    setNotice('Подію взято на контроль.');
    window.setTimeout(() => setNotice(null), 4000);
  };

  const handleAckAll = async () => {
    await ackAll();
    setNotice('Усі непідтверджені події взято на контроль.');
    window.setTimeout(() => setNotice(null), 4000);
  };

  // Перехід між записами журналу стрілками, закриття деталей клавішею Escape.
  const handleKeyDown = (event) => {
    if (pageItems.length === 0) return;
    const currentIndex = pageItems.findIndex((item) => item.id === selectedId);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = currentIndex === -1 ? 0 : Math.min(pageItems.length - 1, currentIndex + 1);
      setSelectedId(pageItems[next].id);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = currentIndex === -1 ? 0 : Math.max(0, currentIndex - 1);
      setSelectedId(pageItems[next].id);
    } else if (event.key === 'Escape') {
      setSelectedId(null);
    }
  };

  const renderList = () => {
    const isLoading = status === 'loading' && events.length === 0;

    if (!isLoading && events.length === 0) {
      return (
        <EmptyState
          title={status === 'error' ? 'Дані недоступні' : 'Журнал порожній'}
          description={
            status === 'error'
              ? 'Не вдалося отримати початковий перелік подій. Спробуйте оновити дані ще раз.'
              : 'За поточну зміну подій не зареєстровано. Нові події з’являться автоматично.'
          }
          action={
            <Button variant="secondary" size="sm" onClick={refresh} disabled={status === 'loading'}>
              Оновити дані
            </Button>
          }
        />
      );
    }

    if (!isLoading && filtered.length === 0) {
      return (
        <EmptyState
          title="Нічого не знайдено"
          description="Жодна подія не відповідає вибраним умовам відбору. Змініть запит або скиньте фільтри."
          action={
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Скинути фільтри
            </Button>
          }
        />
      );
    }

    return (
      <>
        <div className="argus-events__table">
          <div
            role="group"
            aria-label="Таблиця подій. Перехід між рядками — стрілки вгору та вниз."
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <DataTable
              columns={columns}
              data={pageItems}
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId(row.id === selectedId ? null : row.id)}
              loading={isLoading}
              pageInfo={{
                showing: pageItems.length,
                total: filtered.length,
                onPrev: () => setPage(Math.max(1, currentPage - 1)),
                onNext: () => setPage(Math.min(totalPages, currentPage + 1)),
                hasPrev: currentPage > 1,
                hasNext: currentPage < totalPages,
              }}
            />
          </div>
        </div>

        <EventCards
          events={pageItems}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
          onAck={handleAck}
        />
      </>
    );
  };

  return (
    <Panel
      title="Журнал подій"
      actions={
        <div className="argus-events__toolbar-actions">
          <Button variant="secondary" size="sm" onClick={refresh} disabled={status === 'loading'}>
            {status === 'loading' ? 'Оновлення…' : 'Оновити'}
          </Button>
          {isOperator && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAckAll}
                disabled={counters.unack === 0}
              >
                Підтвердити всі ({counters.unack})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setNotice(`Звіт для ${counters.total} подій сформовано.`);
                  window.setTimeout(() => setNotice(null), 5000);
                }}
              >
                Експорт журналу
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="argus-events">
        <EventsSummary
          counters={counters}
          updatedAt={updatedAt}
          isOperator={isOperator}
          filteredCount={filtered.length}
          totalCount={events.length}
        />

        {status === 'error' && (
          <InlineNotification
            status="danger"
            title="Помилка завантаження даних від SENTINEL"
            description={error || 'Не вдалося зв’язатися із сервером. Перевірте стан з’єднання.'}
          />
        )}

        {connection === 'closed' && (
          <InlineNotification
            status="warning"
            title="Втрачено зв’язок з потоком"
            description="WebSocket-потік розірвано. Виконується повторне підключення з перевіркою токена."
          />
        )}

        {caughtUp > 0 && (
          <InlineNotification
            status="info"
            title="Синхронізація після обриву"
            description={`Довантажено ${caughtUp} подій, що виникли під час відсутності зв’язку.`}
          />
        )}

        {notice && (
          <InlineNotification status="success" title="Операцію виконано" description={notice} />
        )}

        <EventsToolbar
          query={filters.query}
          onQueryChange={(value) => applyFilter({ query: value })}
          severity={filters.severity}
          onSeverityChange={(value) => applyFilter({ severity: value })}
          status={filters.status}
          onStatusChange={(value) => applyFilter({ status: value })}
          onReset={resetFilters}
          disabled={status === 'loading' && events.length === 0}
          isFiltered={isFiltered}
        />

        <div className="argus-events__content">
          <div className="argus-events__list">{renderList()}</div>
          <EventDetails
            event={selectedEvent}
            onAck={handleAck}
            onClose={() => setSelectedId(null)}
            canAck
          />
        </div>
      </div>
    </Panel>
  );
};

export default EventsView;
