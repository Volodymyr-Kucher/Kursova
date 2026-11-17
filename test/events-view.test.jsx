import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventsView } from '../src/views/EventsView.jsx';
import { renderWithStore, makeStore, OPERATOR, ANALYST } from './helpers.jsx';
import { ack as apiAck } from '../src/api.js';

vi.mock('../src/api.js', () => ({
  load: vi.fn(() => Promise.resolve([])),
  ack: vi.fn(() => Promise.resolve()),
  stream: vi.fn(() => () => {}),
  normalize: vi.fn((raw) => raw),
}));

beforeEach(() => {
  apiAck.mockClear();
});

function renderView({ profile = OPERATOR, store = makeStore(), connection = 'open', caughtUp = 0 } = {}) {
  return renderWithStore(
    <EventsView profile={profile} connection={connection} caughtUp={caughtUp} />,
    store
  );
}

// Таблиця і список карток існують у DOM одночасно (видимість керується CSS),
// тому всі перевірки вмісту виконуються в межах таблиці.
const table = () => screen.getByRole('group', { name: /Таблиця подій/ });
const detailsPanel = () => screen.getByText('Деталі події').closest('section');
const summary = (container) => container.querySelector('.argus-events__summary');

describe('EventsView — стан даних', () => {
  it('показує всі події журналу в таблиці', () => {
    const { container } = renderView();

    expect(within(table()).getByText('Track entered restricted zone')).toBeInTheDocument();
    expect(within(table()).getByText('Track went dark')).toBeInTheDocument();
    expect(within(table()).getByText('Observation has no matching track')).toBeInTheDocument();
    expect(summary(container)).toHaveTextContent('Всього подій: 3');
  });

  it('показує лічильник непідтверджених подій у діях панелі', () => {
    renderView();
    expect(screen.getByRole('button', { name: /Підтвердити всі \(1\)/ })).toBeInTheDocument();
  });

  it('показує рівень важливості не лише кольором, а й текстом', () => {
    renderView();
    expect(within(table()).getAllByText('High').length).toBeGreaterThan(0);
    expect(within(table()).getAllByText('Medium').length).toBeGreaterThan(0);
    expect(within(table()).getAllByText('Low').length).toBeGreaterThan(0);
  });
});

describe('EventsView — стани завантаження, помилки та відсутності даних', () => {
  it('показує стан завантаження, коли даних ще немає', () => {
    renderView({ store: makeStore({ events: [], status: 'loading' }) });

    expect(screen.queryByText('Журнал порожній')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Оновлення/ })).toBeDisabled();
  });

  it('показує повідомлення про помилку завантаження', () => {
    renderView({ store: makeStore({ status: 'error', error: 'SENTINEL returned error 503' }) });

    expect(screen.getByText('Помилка завантаження даних від SENTINEL')).toBeInTheDocument();
    expect(screen.getByText('SENTINEL returned error 503')).toBeInTheDocument();
  });

  it('показує стан відсутності даних, коли журнал порожній', () => {
    renderView({ store: makeStore({ events: [] }) });

    expect(screen.getByText('Журнал порожній')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Оновити дані' })).toBeInTheDocument();
  });

  it('показує попередження про втрату зв’язку з потоком', () => {
    renderView({ connection: 'closed' });
    expect(screen.getByText('Втрачено зв’язок з потоком')).toBeInTheDocument();
  });

  it('показує повідомлення про довантаження після обриву', () => {
    renderView({ caughtUp: 4 });
    expect(screen.getByText(/Довантажено 4 подій/)).toBeInTheDocument();
  });
});

describe('EventsView — відбір подій', () => {
  it('фільтрує події за пошуковим запитом', async () => {
    const user = userEvent.setup();
    renderView();

    await user.type(screen.getByLabelText(/Пошук/), 'trk-0042');

    expect(within(table()).getByText('Track entered restricted zone')).toBeInTheDocument();
    expect(within(table()).queryByText('Track went dark')).not.toBeInTheDocument();
  });

  it('показує стан «нічого не знайдено» і скидає фільтри', async () => {
    const user = userEvent.setup();
    renderView();

    await user.type(screen.getByLabelText(/Пошук/), 'невідомий-запит');
    expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Скинути фільтри' })[0]);
    expect(within(table()).getByText('Track went dark')).toBeInTheDocument();
  });

  it('фільтрує події за рівнем важливості', async () => {
    const user = userEvent.setup();
    renderView();

    await user.selectOptions(screen.getByLabelText('Важливість'), 'low');

    expect(within(table()).getByText('Observation has no matching track')).toBeInTheDocument();
    expect(within(table()).queryByText('Track entered restricted zone')).not.toBeInTheDocument();
  });

  it('фільтрує події за статусом опрацювання', async () => {
    const user = userEvent.setup();
    renderView();

    await user.selectOptions(screen.getByLabelText('Статус'), 'acknowledged');

    expect(within(table()).getByText('Track went dark')).toBeInTheDocument();
    expect(within(table()).queryByText('Track entered restricted zone')).not.toBeInTheDocument();
  });
});

describe('EventsView — робота з вибраною подією', () => {
  it('відкриває панель деталей після вибору рядка', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(within(table()).getByText('Track entered restricted zone'));

    const details = detailsPanel();
    expect(within(details).getByText('evt-1')).toBeInTheDocument();
    expect(within(details).getByText('trk-0042')).toBeInTheDocument();
    expect(within(details).getByText('zon-0003')).toBeInTheDocument();
  });

  it('переходить між положеннями стрілками вгору та вниз', async () => {
    const user = userEvent.setup();
    renderView();

    table().focus();

    await user.keyboard('{ArrowDown}');
    expect(within(detailsPanel()).getByText('evt-1')).toBeInTheDocument();

    await user.keyboard('{ArrowDown}');
    expect(within(detailsPanel()).getByText('evt-2')).toBeInTheDocument();

    await user.keyboard('{ArrowUp}');
    expect(within(detailsPanel()).getByText('evt-1')).toBeInTheDocument();
  });

  it('закриває деталі клавішею Escape', async () => {
    const user = userEvent.setup();
    renderView();

    table().focus();
    await user.keyboard('{ArrowDown}');
    expect(within(detailsPanel()).getByText('evt-1')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(within(detailsPanel()).queryByText('evt-1')).not.toBeInTheDocument();
  });

  it('надсилає запит підтвердження та оновлює статус події', async () => {
    const user = userEvent.setup();
    const { store } = renderView();

    await user.click(within(table()).getAllByRole('button', { name: 'Підтвердити' })[0]);

    expect(apiAck).toHaveBeenCalledWith('evt-1');
    expect(store.getState().events.records['evt-1'].status).toBe('acknowledged');
  });
});

describe('EventsView — розмежування ролей', () => {
  it('не показує масове підтвердження аналітику', () => {
    renderView({ profile: ANALYST });

    expect(screen.queryByRole('button', { name: /Підтвердити всі/ })).not.toBeInTheDocument();
    expect(screen.getByText(/роль analyst/)).toBeInTheDocument();
  });

  it('показує масове підтвердження оператору', () => {
    renderView({ profile: OPERATOR });
    expect(screen.getByRole('button', { name: /Підтвердити всі/ })).toBeInTheDocument();
  });
});
