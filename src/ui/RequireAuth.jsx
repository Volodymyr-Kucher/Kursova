import React from 'react';
import { useAuth } from 'react-oidc-context';
import { Panel } from './Panel';
import { Button } from './Button';
import { InlineNotification } from './InlineNotification';
import { Skeleton } from './Skeleton';
import { ProgressBar } from './ProgressBar';

export const RequireAuth = ({ children, auth: injectedAuth }) => {
  // Дозволяємо прокидати мок-auth для тестування та Ladle stories
  const contextAuth = useAuth();
  const auth = injectedAuth || contextAuth;

  // Стан 1: Перевірка (завантаження сесії)
  if (auth.isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          padding: 'var(--space-06)',
        }}
      >
        <Panel title="Авторизація ARGUS" style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-05)' }}>
            <ProgressBar value={70} label="Перевірка облікових даних у SENTINEL..." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-03)' }}>
              <Skeleton width="100%" />
              <Skeleton width="75%" />
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  // Стан 2: Помилка автентифікації
  if (auth.error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          padding: 'var(--space-06)',
        }}
      >
        <Panel title="Помилка входу" style={{ maxWidth: 520, width: '100%' }}>
          <InlineNotification
            status="danger"
            title="Не вдалося авторизуватися"
            description={auth.error.message || 'Виникла помилка під час взаємодії з постачальником ідентифікації SENTINEL.'}
          />
          <div style={{ marginTop: 'var(--space-06)', display: 'flex', gap: 'var(--space-04)' }}>
            <Button
              variant="primary"
              onClick={() => {
                if (auth.signinRedirect) auth.signinRedirect();
              }}
            >
              Спробувати знову
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  // Стан 3: Користувач не увійшов
  if (!auth.isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          padding: 'var(--space-06)',
        }}
      >
        <Panel title="Вхід у систему ARGUS / SENTINEL" style={{ maxWidth: 480, width: '100%' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-05)', lineHeight: 1.5 }}>
            Для доступу до журналів спостереження та подій SENTINEL необхідно пройти
            автентифікацію через OpenID Connect.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-05)' }}>
            <Button
              variant="primary"
              onClick={() => {
                if (auth.signinRedirect) auth.signinRedirect();
              }}
            >
              Увійти через SENTINEL (OIDC)
            </Button>
            <div
              className="mono"
              style={{
                fontSize: 'var(--label-01-size)',
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-surface-accent)',
                padding: 'var(--space-04)',
                borderRadius: '2px',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
                Тестові облікові записи:
              </div>
              <div>• <strong>analyst</strong> / analyst — перегляд та підтвердження подій</div>
              <div>• <strong>operator</strong> / operator — повний доступ до операцій</div>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  // Стан 4: Користувач увійшов
  return <>{children}</>;
};

export default RequireAuth;
