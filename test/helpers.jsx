import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createAppStore, initialEventsState } from '../src/store.js';

export const SAMPLE_EVENTS = [
  {
    id: 'evt-1',
    severity: 'high',
    type: 'zone_entry',
    title: 'Track entered restricted zone',
    trackId: 'trk-0042',
    zoneId: 'zon-0003',
    status: 'unacknowledged',
    ts: '2026-10-20T14:02:11.000Z',
  },
  {
    id: 'evt-2',
    severity: 'medium',
    type: 'track_dark',
    title: 'Track went dark',
    trackId: 'trk-0117',
    zoneId: 'zon-0007',
    status: 'acknowledged',
    ts: '2026-10-20T13:48:02.000Z',
  },
  {
    id: 'evt-3',
    severity: 'low',
    type: 'observation_unmatched',
    title: 'Observation has no matching track',
    trackId: null,
    zoneId: 'zon-0007',
    status: 'in_fusion',
    ts: '2026-10-20T13:31:19.000Z',
  },
];

// Створює сховище з наперед визначеним станом журналу.
export function makeStore(overrides = {}) {
  const { events = SAMPLE_EVENTS, ...stateOverrides } = overrides;
  const records = {};
  events.forEach((event) => {
    records[event.id] = event;
  });

  return createAppStore({
    events: {
      ...initialEventsState,
      status: 'ready',
      updatedAt: '2026-10-20T14:05:00.000Z',
      ...stateOverrides,
      records,
    },
  });
}

export function renderWithStore(ui, store = makeStore()) {
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

export const OPERATOR = { role: 'operator', username: 'operator', displayName: 'Оператор' };
export const ANALYST = { role: 'analyst', username: 'analyst', displayName: 'Аналітик' };
