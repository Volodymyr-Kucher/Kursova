import { configureStore, createSlice, createSelector } from '@reduxjs/toolkit';

export const initialEventsState = {
  status: 'idle',        // 'idle' | 'loading' | 'ready' | 'error'
  records: {},           // map id -> record
  error: null,           // string | null
  updatedAt: null,       // ISO string | null
  connection: 'idle',    // 'idle' | 'connecting' | 'open' | 'closed'
  caughtUp: 0,           // number of caught-up records after disconnect
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState: initialEventsState,
  reducers: {
    loadStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    loadSuccess(state, action) {
      state.status = 'ready';
      state.error = null;
      state.updatedAt = new Date().toISOString();
      if (Array.isArray(action.payload)) {
        action.payload.forEach((record) => {
          if (record && record.id) {
            state.records[record.id] = record;
          }
        });
      }
    },
    loadError(state, action) {
      state.status = 'error';
      state.error = action.payload || 'Помилка завантаження даних';
    },
    recordReceived(state, action) {
      const record = action.payload;
      if (record && record.id) {
        state.records[record.id] = record;
      }
    },
    catchupReceived(state, action) {
      if (Array.isArray(action.payload)) {
        action.payload.forEach((record) => {
          if (record && record.id) {
            state.records[record.id] = record;
          }
        });
        state.caughtUp = action.payload.length;
      }
    },
    clearCaughtUp(state) {
      state.caughtUp = 0;
    },
    connectionChanged(state, action) {
      state.connection = action.payload;
    },
    eventAckOptimistic(state, action) {
      const id = action.payload;
      if (state.records[id]) {
        state.records[id].status = 'acknowledged';
      }
    },
    eventAckRollback(state, action) {
      const { id, previousStatus } = action.payload;
      if (state.records[id]) {
        state.records[id].status = previousStatus;
      }
    },
    // Очищення сховища під час виходу із системи
    resetStore(state) {
      state.status = 'idle';
      state.records = {};
      state.error = null;
      state.updatedAt = null;
      state.connection = 'idle';
      state.caughtUp = 0;
    },
  },
});

export const {
  loadStart,
  loadSuccess,
  loadError,
  recordReceived,
  catchupReceived,
  clearCaughtUp,
  connectionChanged,
  eventAckOptimistic,
  eventAckRollback,
  resetStore,
} = eventsSlice.actions;

// ---- Селектори ----
export const selectRecords = (state) => state.events.records;

export const selectAllEvents = createSelector(
  [selectRecords],
  (records) => {
    return Object.values(records).sort((a, b) => {
      const ta = a.ts ? new Date(a.ts).getTime() : -Infinity;
      const tb = b.ts ? new Date(b.ts).getTime() : -Infinity;
      return tb - ta;
    });
  }
);

export const selectEventCounters = createSelector(
  [selectRecords],
  (records) => {
    const list = Object.values(records);
    const open = list.filter((e) => e.status !== 'acknowledged').length;
    const unack = list.filter((e) => e.status === 'unacknowledged').length;
    return { total: list.length, open, unack };
  }
);

export const selectEventsStatus = createSelector(
  [(state) => state.events.status, (state) => state.events.error, (state) => state.events.updatedAt],
  (status, error, updatedAt) => ({
    status,
    error,
    updatedAt,
  })
);

export const selectConnectionStatus = createSelector(
  [(state) => state.events.connection, (state) => state.events.caughtUp],
  (connection, caughtUp) => ({
    connection,
    caughtUp,
  })
);

export const selectEventById = (id) => (state) => state.events.records[id];

export function createAppStore(preloadedState) {
  return configureStore({
    reducer: {
      events: eventsSlice.reducer,
    },
    preloadedState,
  });
}

export const store = createAppStore();
