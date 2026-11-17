import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { load, ack as apiAck } from '../api.js';
import {
  loadStart,
  loadSuccess,
  loadError,
  eventAckOptimistic,
  eventAckRollback,
  selectAllEvents,
} from '../store.js';

export function useEventActions() {
  const dispatch = useDispatch();
  const events = useSelector(selectAllEvents);

  const refresh = useCallback(async () => {
    dispatch(loadStart());
    try {
      const list = await load();
      dispatch(loadSuccess(list));
    } catch (err) {
      dispatch(loadError(err.message || 'Помилка отримання подій'));
    }
  }, [dispatch]);

  const ack = useCallback(
    async (id) => {
      const target = events.find((e) => e.id === id);
      if (!target || target.status === 'acknowledged') return;
      const previousStatus = target.status;
      dispatch(eventAckOptimistic(id));
      try {
        await apiAck(id);
      } catch {
        dispatch(eventAckRollback({ id, previousStatus }));
      }
    },
    [dispatch, events]
  );

  const ackAll = useCallback(async () => {
    const unacked = events.filter((e) => e.status === 'unacknowledged');
    await Promise.allSettled(unacked.map((e) => ack(e.id)));
  }, [events, ack]);

  return { refresh, ack, ackAll };
}
