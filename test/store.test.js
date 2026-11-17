import { describe, it, expect } from 'vitest';
import {
  createAppStore,
  eventsSlice,
  initialEventsState,
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
  selectAllEvents,
  selectEventCounters,
  selectEventsStatus,
  selectConnectionStatus,
} from '../src/store.js';
import { normalize } from '../src/api.js';

describe('Redux Toolkit Store — Events Slice (Auth & Events)', () => {
  it('returns initial state', () => {
    const state = eventsSlice.reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialEventsState);
    expect(state.status).toBe('idle');
    expect(state.records).toEqual({});
    expect(state.connection).toBe('idle');
    expect(state.caughtUp).toBe(0);
  });

  it('handles loadStart', () => {
    const s1 = { ...initialEventsState, error: 'Previous error' };
    const s2 = eventsSlice.reducer(s1, loadStart());
    expect(s2.status).toBe('loading');
    expect(s2.error).toBeNull();
  });

  it('handles loadSuccess', () => {
    const rec1 = { id: 'evt-1', title: 'Test 1', status: 'unacknowledged', ts: '2026-10-20T10:00:00Z' };
    const rec2 = { id: 'evt-2', title: 'Test 2', status: 'acknowledged', ts: '2026-10-20T11:00:00Z' };
    const s2 = eventsSlice.reducer(initialEventsState, loadSuccess([rec1, rec2]));

    expect(s2.status).toBe('ready');
    expect(s2.error).toBeNull();
    expect(s2.updatedAt).not.toBeNull();
    expect(s2.records['evt-1']).toEqual(rec1);
    expect(s2.records['evt-2']).toEqual(rec2);
  });

  it('handles loadError', () => {
    const s2 = eventsSlice.reducer(initialEventsState, loadError('Server failure'));
    expect(s2.status).toBe('error');
    expect(s2.error).toBe('Server failure');
  });

  it('handles recordReceived (upsert by id)', () => {
    const rec1 = { id: 'evt-1', title: 'Initial', status: 'unacknowledged', ts: '2026-10-20T10:00:00Z' };
    const s1 = eventsSlice.reducer(initialEventsState, loadSuccess([rec1]));

    const rec1Updated = { id: 'evt-1', title: 'Updated Title', status: 'acknowledged', ts: '2026-10-20T10:05:00Z' };
    const s2 = eventsSlice.reducer(s1, recordReceived(rec1Updated));

    expect(s2.records['evt-1'].title).toBe('Updated Title');
    expect(s2.records['evt-1'].status).toBe('acknowledged');
  });

  it('handles catchupReceived and clearCaughtUp', () => {
    const rec1 = { id: 'evt-c1', title: 'Catchup 1', status: 'unacknowledged', ts: '2026-10-20T10:00:00Z' };
    const rec2 = { id: 'evt-c2', title: 'Catchup 2', status: 'unacknowledged', ts: '2026-10-20T10:01:00Z' };

    const s1 = eventsSlice.reducer(initialEventsState, catchupReceived([rec1, rec2]));
    expect(s1.caughtUp).toBe(2);
    expect(s1.records['evt-c1']).toBeDefined();
    expect(s1.records['evt-c2']).toBeDefined();

    const s2 = eventsSlice.reducer(s1, clearCaughtUp());
    expect(s2.caughtUp).toBe(0);
  });

  it('handles connectionChanged', () => {
    const s1 = eventsSlice.reducer(initialEventsState, connectionChanged('open'));
    expect(s1.connection).toBe('open');

    const s2 = eventsSlice.reducer(s1, connectionChanged('closed'));
    expect(s2.connection).toBe('closed');
  });

  it('handles eventAckOptimistic and eventAckRollback', () => {
    const rec = { id: 'evt-10', title: 'Alert', status: 'unacknowledged' };
    const s1 = eventsSlice.reducer(initialEventsState, loadSuccess([rec]));

    const s2 = eventsSlice.reducer(s1, eventAckOptimistic('evt-10'));
    expect(s2.records['evt-10'].status).toBe('acknowledged');

    const s3 = eventsSlice.reducer(s2, eventAckRollback({ id: 'evt-10', previousStatus: 'unacknowledged' }));
    expect(s3.records['evt-10'].status).toBe('unacknowledged');
  });

  it('handles resetStore on logout (Rule 6)', () => {
    const rec = { id: 'evt-1', title: 'Confidential event', status: 'unacknowledged' };
    const s1 = eventsSlice.reducer(initialEventsState, loadSuccess([rec]));
    expect(Object.keys(s1.records)).toHaveLength(1);

    const s2 = eventsSlice.reducer(s1, resetStore());
    expect(s2.records).toEqual({});
    expect(s2.status).toBe('idle');
    expect(s2.error).toBeNull();
    expect(s2.updatedAt).toBeNull();
  });
});

describe('Selectors', () => {
  const rootState = {
    events: {
      status: 'ready',
      error: null,
      updatedAt: '2026-10-20T12:00:00.000Z',
      connection: 'open',
      caughtUp: 3,
      records: {
        'evt-1': { id: 'evt-1', title: 'Earlier', status: 'unacknowledged', ts: '2026-10-20T08:00:00Z' },
        'evt-2': { id: 'evt-2', title: 'Later', status: 'acknowledged', ts: '2026-10-20T10:00:00Z' },
        'evt-3': { id: 'evt-3', title: 'Middle', status: 'in_fusion', ts: '2026-10-20T09:00:00Z' },
        'evt-no-ts': { id: 'evt-no-ts', title: 'No timestamp', status: 'unacknowledged', ts: null },
      },
    },
  };

  it('selectAllEvents sorts records newest first with missing ts at end', () => {
    const list = selectAllEvents(rootState);
    expect(list.map((e) => e.id)).toEqual(['evt-2', 'evt-3', 'evt-1', 'evt-no-ts']);
  });

  it('selectEventCounters calculates total, open, and unacknowledged counts', () => {
    const counters = selectEventCounters(rootState);
    expect(counters.total).toBe(4);
    expect(counters.open).toBe(3);
    expect(counters.unack).toBe(2);
  });

  it('selectEventsStatus returns query status object', () => {
    const status = selectEventsStatus(rootState);
    expect(status).toEqual({
      status: 'ready',
      error: null,
      updatedAt: '2026-10-20T12:00:00.000Z',
    });
  });

  it('selectConnectionStatus returns connection state', () => {
    const conn = selectConnectionStatus(rootState);
    expect(conn).toEqual({
      connection: 'open',
      caughtUp: 3,
    });
  });
});

describe('createAppStore integration', () => {
  it('creates functional Redux store', () => {
    const store = createAppStore();
    expect(store.getState().events.status).toBe('idle');

    store.dispatch(connectionChanged('connecting'));
    expect(store.getState().events.connection).toBe('connecting');
  });
});

describe('normalize', () => {
  it('normalizes raw SENTINEL event into serializable format', () => {
    const raw = {
      id: 'evt-999',
      severity: 'WARNING',
      title: 'Suspicious track movement',
      type: 'track_alert',
      track_id: 'trk-007',
      zone_id: 'zon-001',
      status: 'unacknowledged',
      created_at: '2026-10-20T14:30:00Z',
    };
    const norm = normalize(raw);
    expect(norm.id).toBe('evt-999');
    expect(norm.severity).toBe('warning');
    expect(norm.title).toBe('Suspicious track movement');
    expect(norm.trackId).toBe('trk-007');
    expect(norm.zoneId).toBe('zon-001');
    expect(norm.status).toBe('unacknowledged');
    expect(norm.ts).toBe('2026-10-20T14:30:00.000Z');
  });

  it('handles empty or missing fields safely', () => {
    const norm = normalize({});
    expect(norm.id).toBe('');
    expect(norm.severity).toBeNull();
    expect(norm.title).toBeNull();
    expect(norm.trackId).toBeNull();
    expect(norm.zoneId).toBeNull();
    expect(norm.status).toBeNull();
    expect(norm.ts).toBeNull();
  });
});
