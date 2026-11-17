import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/auth.js', () => ({
  accessToken: vi.fn(),
  renewToken: vi.fn(),
  signIn: vi.fn(),
}));

import { accessToken, renewToken, signIn } from '../src/auth.js';
import { load, ack, stream } from '../src/api.js';

const response = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const RAW_EVENT = {
  id: 7,
  severity: 'CRITICAL',
  title: ' Вхід у заборонену зону ',
  status: 'unacknowledged',
  ts: '2026-01-01T10:00:00Z',
};

class FakeSocket {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.handlers = {};
    this.closed = false;
    FakeSocket.instances.push(this);
  }

  addEventListener(name, handler) {
    this.handlers[name] = handler;
  }

  close() {
    this.closed = true;
  }
}

let fetchMock;

beforeEach(() => {
  vi.clearAllMocks();
  accessToken.mockResolvedValue('token-1');
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  FakeSocket.instances = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api — REST із авторизацією', () => {
  it('надсилає Bearer-токен і нормалізує отримані події', async () => {
    fetchMock.mockResolvedValue(response(200, { data: [RAW_EVENT] }));

    const records = await load();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/v1/events');
    expect(options.headers.Authorization).toBe('Bearer token-1');
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      id: '7',
      severity: 'critical',
      title: 'Вхід у заборонену зону',
      status: 'unacknowledged',
    });
  });

  it('після 401 оновлює токен і один раз повторює запит', async () => {
    renewToken.mockResolvedValue('token-2');
    fetchMock
      .mockResolvedValueOnce(response(401, {}))
      .mockResolvedValueOnce(response(200, [RAW_EVENT]));

    const records = await load();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(renewToken).toHaveBeenCalledTimes(1);
    expect(records).toHaveLength(1);
  });

  it('якщо токен оновити не вдалося, переспрямовує на вхід', async () => {
    renewToken.mockResolvedValue(null);
    fetchMock.mockResolvedValue(response(401, {}));

    await expect(load()).rejects.toThrow('Сесія закінчилася');
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('не зациклюється, якщо повторний запит знову повертає 401', async () => {
    renewToken.mockResolvedValue('token-2');
    fetchMock.mockResolvedValue(response(401, {}));

    await expect(load()).rejects.toThrow('401');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('повідомляє про відсутність прав при 403', async () => {
    fetchMock.mockResolvedValue(response(403, {}));

    await expect(load()).rejects.toThrow('403');
    expect(renewToken).not.toHaveBeenCalled();
  });

  it('повідомляє про недоступність сервера', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(load()).rejects.toThrow('Could not reach SENTINEL');
  });

  it('відхиляє відповідь неочікуваного формату', async () => {
    fetchMock.mockResolvedValue(response(200, { unexpected: true }));

    await expect(load()).rejects.toThrow('Unexpected response format');
  });

  it('квитування надсилає POST на адресу події', async () => {
    fetchMock.mockResolvedValue(response(204, null));

    await ack('evt-42');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/v1/events/evt-42/ack');
    expect(options.method).toBe('POST');
  });
});

describe('api — потік подій WebSocket', () => {
  it('підключається з токеном, довантажує пропущене та приймає нові події', async () => {
    vi.stubGlobal('WebSocket', FakeSocket);
    fetchMock.mockResolvedValueOnce(response(200, [RAW_EVENT]));
    await load();

    const missed = { id: 8, severity: 'info', status: 'unacknowledged', ts: '2026-01-01T10:05:00Z' };
    fetchMock.mockResolvedValueOnce(response(200, [missed]));

    const handlers = {
      onStatus: vi.fn(),
      onRecord: vi.fn(),
      onCatchup: vi.fn(),
    };
    const stop = stream(handlers);

    await vi.waitFor(() => expect(FakeSocket.instances).toHaveLength(1));
    const socket = FakeSocket.instances[0];
    expect(socket.url).toContain('channels=events');
    expect(socket.url).toContain('access_token=token-1');

    await socket.handlers.open();
    expect(handlers.onStatus).toHaveBeenCalledWith('open');
    expect(fetchMock.mock.calls[1][0]).toContain('since=2026-01-01T10%3A00%3A00Z');
    expect(handlers.onCatchup).toHaveBeenCalledTimes(1);
    expect(handlers.onCatchup.mock.calls[0][0][0].id).toBe('8');

    socket.handlers.message({
      data: JSON.stringify({ type: 'event.new', data: { id: 9, severity: 'warning' } }),
    });
    expect(handlers.onRecord).toHaveBeenCalledTimes(1);
    expect(handlers.onRecord.mock.calls[0][0]).toMatchObject({ id: '9', severity: 'warning' });

    socket.handlers.message({ data: JSON.stringify({ type: 'heartbeat' }) });
    socket.handlers.message({ data: 'не JSON' });
    expect(handlers.onRecord).toHaveBeenCalledTimes(1);

    stop();
    expect(socket.closed).toBe(true);
  });

  it('при коді закриття 1008 і невдалому оновленні токена переспрямовує на вхід', async () => {
    vi.stubGlobal('WebSocket', FakeSocket);
    renewToken.mockResolvedValue(null);
    const handlers = { onStatus: vi.fn(), onRecord: vi.fn(), onCatchup: vi.fn() };

    const stop = stream(handlers);
    await vi.waitFor(() => expect(FakeSocket.instances).toHaveLength(1));

    await FakeSocket.instances[0].handlers.close({ code: 1008 });

    expect(renewToken).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(handlers.onStatus).toHaveBeenLastCalledWith('closed');
    stop();
  });
});
