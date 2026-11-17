import React from 'react';
import { RequireAuth } from './RequireAuth';

export const LoadingState = () => (
  <RequireAuth auth={{ isLoading: true, isAuthenticated: false, error: null }}>
    <div>Контент, захищений автентифікацією</div>
  </RequireAuth>
);

export const ErrorState = () => (
  <RequireAuth
    auth={{
      isLoading: false,
      isAuthenticated: false,
      error: new Error('Недійсний токен або сервер OIDC недоступний (ERR_CONNECTION_REFUSED)'),
      signinRedirect: () => alert('Signin triggered'),
    }}
  >
    <div>Контент, захищений автентифікацією</div>
  </RequireAuth>
);

export const UnauthenticatedState = () => (
  <RequireAuth
    auth={{
      isLoading: false,
      isAuthenticated: false,
      error: null,
      signinRedirect: () => alert('Signin triggered'),
    }}
  >
    <div>Контент, захищений автентифікацією</div>
  </RequireAuth>
);

export const AuthenticatedState = () => (
  <RequireAuth
    auth={{
      isLoading: false,
      isAuthenticated: true,
      error: null,
      user: { profile: { preferred_username: 'analyst', role: 'analyst' } },
    }}
  >
    <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}>
      <h3>Успішно авторизовано!</h3>
      <p>Це приватний вміст сторінки подій ARGUS, видимий лише авторизованому користувачу.</p>
    </div>
  </RequireAuth>
);
