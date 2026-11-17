# ARGUS Events — Вебінтерфейс журналу подій

Курсова робота з навчальної дисципліни «Web-технології та Web-дизайн»  
**Тема:** Розроблення вебінтерфейсу журналу подій чергового оператора системи наземного моніторингу руху морських і повітряних об'єктів  
**Виконав:** слухач навчальної групи 231 В. Кучер  
**Керівник:** викладач кафедри № 22, л-т І. Курінний  
Київ — 2026

---

## Призначення

Підсистема «Журнал подій» призначена для автоматизованого робочого місця чергового оператора комплексу моніторингу надводної та повітряної обстановки ARGUS. Вона забезпечує:

- прийом та відображення потоку системних подій у реальному часі через WebSocket;
- індивідуальне та групове квитування (підтвердження взяття на контроль) з оптимістичним оновленням інтерфейсу та відкатом у разі помилки;
- фільтрацію за текстом, рівнем важливості та статусом опрацювання;
- автоматичне довантаження пропущених подій (catch-up) після відновлення зв'язку;
- автентифікацію за протоколом OpenID Connect (SENTINEL) та розмежування ролей `analyst` / `operator`.

Пояснювальна записка до курсової роботи описує вимоги В-1 … В-12, а таблиця 3.1 записки зіставляє їх із файлами цього репозиторію.

---

## Стек технологій

| Призначення | Технологія |
|---|---|
| Бібліотека інтерфейсу | React 18 |
| Управління станом | Redux Toolkit (`createSlice`, `createSelector`) |
| Автентифікація | `oidc-client-ts`, `react-oidc-context` (Authorization Code + PKCE) |
| Збирання | Vite 6 |
| Дизайн-система | IBM Carbon, тема Gray 100 (`src/tokens.css`) |
| Каталог компонентів | Ladle |
| Тестування | Vitest, Testing Library, jsdom |
| Перевірка коду | ESLint 9 |

---

## Структура проєкту

```
.
├── .ladle/                  # конфігурація каталогу компонентів Ladle
├── src/
│   ├── hooks/               # useEvents, useEventCounters, useEventActions,
│   │                        # useConnectionStatus, useEventsStatus
│   ├── layout/              # AppHeader, SideNav, ConnectionBadge
│   ├── ui/                  # 13 базових компонентів та їхні історії (*.stories.jsx)
│   ├── views/
│   │   ├── EventsView.jsx   # представлення «Журнал подій»
│   │   ├── PlaceholderView.jsx
│   │   └── events/          # columns, EventCards, EventDetails, EventsSummary,
│   │                        # EventsToolbar, filters.js, format.js
│   ├── api.js               # REST-клієнт (authFetch) і WebSocket-потік
│   ├── auth.js              # UserManager OIDC, токени
│   ├── session.jsx          # контекст сесії (OIDC / демонстраційний)
│   ├── demo.js              # автономний режим ?mock=ok
│   ├── data.js              # мок-дані для демонстрації
│   ├── store.js             # Redux Toolkit store, селектори
│   ├── tokens.css           # дизайн-токени IBM Carbon Gray 100
│   └── main.jsx             # точка входу
├── test/                    # автоматичні тести Vitest (5 наборів)
├── DECISIONS.md             # обґрунтування технічних рішень
├── index.html
├── package.json
└── vite.config.js
```

---

## Запуск

Потрібен Node.js 18 або новіший.

```bash
npm install        # встановлення залежностей
npm run dev        # режим розробки: http://localhost:5173
npm run build      # виробнича збірка у dist/
npm run preview    # перегляд виробничої збірки
npm run ladle      # каталог компонентів: http://localhost:61000
npm test           # автоматичні тести
npm run lint       # перевірка ESLint
```

### Демонстраційний режим (без сервера SENTINEL)

| Адреса | Що показує |
|---|---|
| `http://localhost:5173/?mock=ok` | журнал із даними та імітованим потоком, обривом і довантаженням |
| `http://localhost:5173/?mock=empty` | порожній журнал |
| `http://localhost:5173/?mock=error` | помилка завантаження |
| `http://localhost:5173/?mock=ok&role=analyst` | те саме з роллю аналітика (масове підтвердження недоступне) |

### Підключення до сервера SENTINEL

Адреси задаються змінними середовища (файл `.env`):

| Змінна | Значення за замовчуванням |
|---|---|
| `VITE_API` | `http://localhost:8080` |
| `VITE_WS` | `ws://localhost:8080/v1/stream?channels=events` |
| `VITE_AUTH_URL` | `http://localhost:8080/oidc` |

---

## Автоматичні тести

`npm test` виконує 63 тести у п'яти наборах:

| Набір | Тестів | Що перевіряє |
|---|---|---|
| `test/store.test.js` | 16 | редуктор, оптимістичне квитування і відкат, скидання сховища, селектори, `normalize()` |
| `test/filters.test.js` | 12 | відбір подій, пагінація, форматування часу |
| `test/ui.test.jsx` | 7 | `Select`, `EmptyState`, `ConnectionBadge`, `DataTable`, `Severity` |
| `test/events-view.test.jsx` | 18 | стани журналу, відбір, деталі події, квитування, права ролей |
| `test/api.test.js` | 10 | Bearer-токен, повтор після 401, 403, збої мережі, `?since=`, WebSocket, код 1008 |
