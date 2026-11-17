import { describe, it, expect } from 'vitest';
import { filterEvents, paginate, PAGE_SIZE } from '../src/views/events/filters.js';
import { formatTime, formatDateTime } from '../src/views/events/format.js';

const EVENTS = [
  { id: 'evt-1', severity: 'high', title: 'Zone entry', trackId: 'trk-1', zoneId: 'zon-1', status: 'unacknowledged' },
  { id: 'evt-2', severity: 'critical', title: 'Position jump', trackId: 'trk-2', zoneId: null, status: 'unacknowledged' },
  { id: 'evt-3', severity: 'warning', title: 'Feed stopped', trackId: null, zoneId: 'zon-2', status: 'acknowledged' },
  { id: 'evt-4', severity: 'info', title: 'Rules updated', trackId: null, zoneId: 'zon-1', status: 'in_fusion' },
];

describe('filterEvents', () => {
  it('повертає всі події без умов відбору', () => {
    expect(filterEvents(EVENTS)).toHaveLength(4);
  });

  it('шукає за назвою без урахування регістру', () => {
    const result = filterEvents(EVENTS, { query: 'ZONE' });
    expect(result.map((event) => event.id)).toEqual(['evt-1']);
  });

  it('шукає за треком, зоною та ідентифікатором', () => {
    expect(filterEvents(EVENTS, { query: 'trk-2' }).map((e) => e.id)).toEqual(['evt-2']);
    expect(filterEvents(EVENTS, { query: 'zon-1' }).map((e) => e.id)).toEqual(['evt-1', 'evt-4']);
    expect(filterEvents(EVENTS, { query: 'evt-3' }).map((e) => e.id)).toEqual(['evt-3']);
  });

  it('об’єднує critical з high, warning з medium, info з low', () => {
    expect(filterEvents(EVENTS, { severity: 'high' }).map((e) => e.id)).toEqual(['evt-1', 'evt-2']);
    expect(filterEvents(EVENTS, { severity: 'medium' }).map((e) => e.id)).toEqual(['evt-3']);
    expect(filterEvents(EVENTS, { severity: 'low' }).map((e) => e.id)).toEqual(['evt-4']);
  });

  it('відбирає події за статусом опрацювання', () => {
    expect(filterEvents(EVENTS, { status: 'unacknowledged' })).toHaveLength(2);
    expect(filterEvents(EVENTS, { status: 'in_fusion' }).map((e) => e.id)).toEqual(['evt-4']);
  });

  it('поєднує кілька умов одночасно', () => {
    const result = filterEvents(EVENTS, { query: 'zon-1', status: 'unacknowledged' });
    expect(result.map((event) => event.id)).toEqual(['evt-1']);
  });

  it('повертає порожній перелік, якщо збігів немає', () => {
    expect(filterEvents(EVENTS, { query: 'немає-такого' })).toEqual([]);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, index) => ({ id: `e-${index}` }));

  it('ділить перелік на сторінки заданого розміру', () => {
    const first = paginate(items, 1);
    expect(first.items).toHaveLength(PAGE_SIZE);
    expect(first.totalPages).toBe(3);
  });

  it('обмежує номер сторінки знизу та зверху', () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate(items, 0).page).toBe(1);
    expect(paginate([], 5).totalPages).toBe(1);
  });

  it('повертає останню неповну сторінку', () => {
    const last = paginate(items, 3);
    expect(last.items).toHaveLength(5);
  });
});

describe('format', () => {
  it('подає час у UTC', () => {
    expect(formatTime('2026-10-20T14:02:11Z')).toBe('14:02:11');
    expect(formatDateTime('2026-10-20T14:02:11Z')).toBe('2026-10-20 14:02:11 UTC');
  });

  it('позначає відсутній або зіпсований час', () => {
    expect(formatTime(null)).toBe('—');
    expect(formatTime('не час')).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
  });
});
