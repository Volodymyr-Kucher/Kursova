// src/api.js — Клієнт взаємодії з REST API та WebSocket stream комплексу SENTINEL
import { accessToken, renewToken, signIn } from './auth.js';
import { MOCK } from './data.js';

const BASE_URL    = import.meta.env.VITE_API || 'http://localhost:8080';
const WS_BASE_URL = import.meta.env.VITE_WS  || 'ws://localhost:8080/v1/stream';

// ---- Нормалізація ----
export function normalize(raw) {
  const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
  const KNOWN_SEV = ['critical', 'warning', 'info', 'high', 'medium', 'low'];
  const sev = (text(raw && raw.severity) || '').toLowerCase();
  let status = (text(raw && raw.status) || '').toLowerCase();
  if (!status && typeof (raw && raw.acknowledged) === 'boolean') {
    status = raw.acknowledged ? 'acknowledged' : 'unacknowledged';
  }
  const tsRaw = text(raw && raw.ts) || text(raw && raw.created_at);
  let ts = null;
  if (tsRaw) {
    const d = new Date(tsRaw);
    if (!Number.isNaN(d.getTime())) {
      ts = d.toISOString();
    }
  }

  return {
    id: String(raw && raw.id != null ? raw.id : ''),
    severity: KNOWN_SEV.includes(sev) ? sev : null,
    title: text(raw && raw.title) || text(raw && raw.message),
    type: text(raw && raw.type),
    trackId: text(raw && raw.track_id),
    zoneId: text(raw && raw.zone_id),
    status: status || null,
    ts: ts,
    tsRaw: tsRaw,
  };
}

let lastTs = null;
function bumpTs(tsString) {
  if (!tsString) return;
  const d = new Date(tsString);
  if (Number.isNaN(d.getTime())) return;
  if (!lastTs || d > new Date(lastTs)) lastTs = tsString;
}
function bumpFromRecords(records) {
  records.forEach((r) => bumpTs(r.tsRaw || r.ts));
}

function unwrap(body) {
  const list = Array.isArray(body) ? body : body && body.data;
  if (!Array.isArray(list)) throw new Error('Unexpected response format from SENTINEL.');
  return list.map(normalize);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const getMockVariant = () => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.has('mock') ? (params.get('mock') || 'ok') : null;
};

// Авторизований fetch з Bearer-токеном та автоповтором при 401
async function authFetch(path, options = {}, isRetry = false) {
  const token = await accessToken();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not reach SENTINEL. Check the server is running on localhost:8080.');
  }

  // Обробка 401 Unauthorized: оновлюємо токен і повторюємо один раз
  if (res.status === 401 && !isRetry) {
    const newToken = await renewToken();
    if (newToken) {
      return authFetch(path, options, true);
    } else {
      signIn();
      throw new Error('Сесія закінчилася. Перенаправлення на вхід у SENTINEL...');
    }
  }

  // Обробка 403 Forbidden: дія заборонена для поточної ролі
  if (res.status === 403) {
    throw new Error('Дія не дозволена (403 Forbidden). Необхідні права operator.');
  }

  if (!res.ok) {
    let detail = '';
    try {
      const b = await res.json();
      detail = b.message || b.error || '';
    } catch {
      /* no body */
    }
    throw new Error(`SENTINEL returned error ${res.status}${detail ? ': ' + detail : ''}.`);
  }

  return res;
}

// ---------- REST ----------
async function loadMock(variant) {
  await wait(500);
  if (variant === 'error') throw new Error(`SENTINEL returned error ${MOCK.error.status}.`);
  const records = unwrap(MOCK[variant] || MOCK.ok);
  bumpFromRecords(records);
  return records;
}

async function fetchEvents(query) {
  const res = await authFetch(`/v1/events${query || ''}`);
  return unwrap(await res.json());
}

async function loadReal() {
  const records = await fetchEvents('');
  bumpFromRecords(records);
  return records;
}

export function load() {
  const mockVariant = getMockVariant();
  return mockVariant ? loadMock(mockVariant) : loadReal();
}

async function catchUp() {
  if (!lastTs) return [];
  const mockVariant = getMockVariant();
  const records = mockVariant
    ? await loadMockCatchup()
    : await fetchEvents(`?since=${encodeURIComponent(lastTs)}`);
  bumpFromRecords(records);
  return records;
}

// ---------- Підтвердження (Ack) ----------
export async function ack(id) {
  const mockVariant = getMockVariant();
  if (mockVariant) {
    await wait(200);
    return;
  }
  await authFetch(`/v1/events/${encodeURIComponent(id)}/ack`, {
    method: 'POST',
  });
}

// ---------- STREAM (WebSocket) ----------
function streamReal(handlers) {
  let socket = null;
  let stopped = false;
  let retry = 0;

  async function open() {
    if (stopped) return;
    handlers.onStatus('connecting');

    const token = await accessToken();
    const tokenQuery = token ? `&access_token=${encodeURIComponent(token)}` : '';
    const wsUrl = WS_BASE_URL.includes('?')
      ? `${WS_BASE_URL}${tokenQuery}`
      : `${WS_BASE_URL}?channels=events${tokenQuery}`;

    try {
      socket = new WebSocket(wsUrl);
    } catch {
      scheduleReconnect();
      return;
    }

    socket.addEventListener('open', async () => {
      retry = 0;
      handlers.onStatus('open');
      try {
        const missed = await catchUp();
        if (missed.length && !stopped) handlers.onCatchup(missed);
      } catch {
        /* noop */
      }
    });

    socket.addEventListener('message', (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (!msg || (msg.type !== 'event.new' && msg.type !== 'event.update')) return;
      const record = normalize(msg.data);
      bumpTs(msg.ts || record.tsRaw || record.ts);
      handlers.onRecord(record);
    });

    socket.addEventListener('close', async (ev) => {
      if (stopped) return;
      // Якщо код 1008 — токен недійсний
      if (ev.code === 1008) {
        const refreshed = await renewToken();
        if (!refreshed) {
          handlers.onStatus('closed');
          signIn();
          return;
        }
      }
      scheduleReconnect();
    });

    socket.addEventListener('error', () => {
      try {
        socket.close();
      } catch {
        /* noop */
      }
    });
  }

  function scheduleReconnect() {
    if (stopped) return;
    handlers.onStatus('closed');
    retry += 1;
    const delay = Math.min(1000 * 2 ** (retry - 1), 15000);
    setTimeout(open, delay);
  }

  open();
  return function stop() {
    stopped = true;
    if (socket) {
      socket.close();
    }
  };
}

// Імітований stream для мок-режиму
function nowIso() {
  return new Date().toISOString();
}

async function loadMockCatchup() {
  await wait(400);
  return (MOCK.catchup || []).map((raw) => normalize({ ...raw, ts: nowIso() }));
}

function streamMock(handlers) {
  const script = MOCK.stream || [];
  let stopped = false;
  const timers = [];
  const after = (ms, fn) =>
    timers.push(
      setTimeout(() => {
        if (!stopped) fn();
      }, ms)
    );

  const emit = (item) => {
    const record = normalize({ ...item.data, ts: nowIso() });
    bumpTs(record.tsRaw || record.ts);
    handlers.onRecord(record);
  };

  handlers.onStatus('connecting');
  after(600, () => handlers.onStatus('open'));

  after(2000, () => emit(script[0]));
  after(3500, () => emit(script[1]));

  after(5000, () => handlers.onStatus('closed'));
  after(8000, () => handlers.onStatus('connecting'));
  after(8800, async () => {
    handlers.onStatus('open');
    const missed = await loadMockCatchup();
    if (!stopped && missed.length) handlers.onCatchup(missed);
  });

  after(11000, () => emit(script[2]));
  after(13000, () => emit(script[3]));

  return function stop() {
    stopped = true;
    timers.forEach(clearTimeout);
  };
}

export function stream(handlers) {
  const mockVariant = getMockVariant();
  return mockVariant ? streamMock(handlers) : streamReal(handlers);
}
