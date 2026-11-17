// Демонстраційний режим роботи без серверної частини SENTINEL.
// Керується параметрами адреси: ?mock=ok | ?mock=empty | ?mock=error та ?role=analyst.
const MOCK_PARAM = 'mock';
const ROLE_PARAM = 'role';

const DEMO_PROFILES = {
  operator: { preferred_username: 'operator', name: 'Черговий оператор', role: 'operator' },
  analyst: { preferred_username: 'analyst', name: 'Аналітик зміни', role: 'analyst' },
};

function searchParams() {
  if (typeof window === 'undefined') return new URLSearchParams('');
  return new URLSearchParams(window.location.search);
}

export function demoVariant() {
  const params = searchParams();
  if (!params.has(MOCK_PARAM)) return null;
  return params.get(MOCK_PARAM) || 'ok';
}

export function isDemoMode() {
  return demoVariant() !== null;
}

export function demoRole() {
  return searchParams().get(ROLE_PARAM) === 'analyst' ? 'analyst' : 'operator';
}

// Об'єкт сесії тієї самої форми, що повертає react-oidc-context,
// тому компоненти не відрізняють демонстраційний режим від справжнього входу.
export function demoSession() {
  const role = demoRole();
  return {
    isLoading: false,
    isAuthenticated: true,
    error: null,
    user: { profile: DEMO_PROFILES[role] },
    signinRedirect() {},
    signoutRedirect() {},
  };
}
