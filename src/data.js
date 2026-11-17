// Мок-дані для ПЗ 2/7 (ARGUS, Events): GET /v1/events + stream `events`.
// Форма записів відповідає екрану events.png (severity, title, track/zone, ts, status).
//
// Поля запису події (як у REST, так і в data зі stream):
//   { id, severity, title, type, track_id, zone_id, status, ts }
//   severity: 'high' | 'medium' | 'low'
//   status:   'unacknowledged' | 'acknowledged' | 'in_fusion'
export const MOCK = {
  // звичайна відповідь (6 подій, як на екрані) + незручні випадки
  ok: {
    data: [
      {
        id: 'evt-1042', severity: 'high', type: 'zone_entry',
        title: 'Track entered restricted zone',
        track_id: 'trk-0042', zone_id: 'zon-0003',
        status: 'unacknowledged', ts: '2026-10-20T14:02:11Z'
      },
      {
        id: 'evt-1038', severity: 'high', type: 'position_jump',
        title: 'Implausible position jump',
        track_id: 'trk-0311', zone_id: null,
        status: 'unacknowledged', ts: '2026-10-20T13:58:40Z'
      },
      {
        id: 'evt-1031', severity: 'medium', type: 'track_dark',
        title: 'Track went dark',
        track_id: 'trk-0117', zone_id: 'zon-0007',
        status: 'acknowledged', ts: '2026-10-20T13:48:02Z'
      },
      {
        id: 'evt-1026', severity: 'medium', type: 'feed_stopped',
        title: 'Feed relay stopped reporting',
        track_id: null, zone_id: null,
        status: 'acknowledged', ts: '2026-10-20T13:40:55Z'
      },
      {
        id: 'evt-1019', severity: 'low', type: 'observation_unmatched',
        title: 'Observation has no matching track',
        track_id: null, zone_id: 'zon-0007',
        status: 'in_fusion', ts: '2026-10-20T13:31:19Z'
      },
      {
        id: 'evt-1012', severity: 'low', type: 'zone_rules_updated',
        title: 'Zone rules updated by operator',
        track_id: null, zone_id: 'zon-0003',
        status: 'acknowledged', ts: '2026-10-20T13:12:03Z'
      },
      // незручні випадки: відсутня severity / розмітка в тексті / зіпсований час / порожній title
      {
        id: 'evt-1007', severity: null, type: 'unknown',
        title: 'Sensor health degraded <b>!</b>',
        track_id: null, zone_id: null,
        status: 'unacknowledged', ts: '2026-10-20T13:05:41Z'
      },
      {
        id: 'evt-1004', severity: 'low', type: 'zone_entry',
        title: '', track_id: 'trk-0205', zone_id: 'zon-0011',
        status: 'acknowledged', ts: 'не час'
      }
    ]
  },
  empty: { data: [] },
  // імітація помилки сервера
  error: { status: 503, body: { error: 'unavailable', message: 'Mock server error' } },

  // --- матеріал для імітованого stream у мок-режимі (?mock) ---
  stream: [
    { type: 'event.new', data: {
        id: 'evt-1050', severity: 'high', type: 'zone_entry',
        title: 'Second vessel entered restricted zone',
        track_id: 'trk-0088', zone_id: 'zon-0003',
        status: 'unacknowledged' } },
    { type: 'event.update', data: {
        id: 'evt-1038', severity: 'high', type: 'position_jump',
        title: 'Implausible position jump',
        track_id: 'trk-0311', zone_id: null,
        status: 'acknowledged' } },
    { type: 'event.new', data: {
        id: 'evt-1051', severity: 'medium', type: 'track_dark',
        title: 'Coastal freighter went dark',
        track_id: 'trk-0117', zone_id: 'zon-0007',
        status: 'unacknowledged' } },
    { type: 'event.new', data: {
        id: 'evt-1052', severity: 'low', type: 'observation_unmatched',
        title: 'Radar contact matches no known track',
        track_id: null, zone_id: null,
        status: 'in_fusion' } }
  ],
  // Події, що «сталися» під час уявного обриву
  catchup: [
    { id: 'evt-1053', severity: 'high', type: 'position_jump',
      title: 'Position jump while link was down',
      track_id: 'trk-0402', zone_id: null,
      status: 'unacknowledged' },
    { id: 'evt-1054', severity: 'medium', type: 'feed_stopped',
      title: 'AIS receiver dropped out',
      track_id: null, zone_id: null,
      status: 'unacknowledged' }
  ]
};
