import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AuthProvider } from 'react-oidc-context';
import { userManager, signOut } from './auth.js';
import {
  store,
  loadStart,
  loadSuccess,
  loadError,
  connectionChanged,
  recordReceived,
  catchupReceived,
  clearCaughtUp,
  resetStore,
} from './store.js';
import { load, stream } from './api.js';
import App from './App.jsx';
import { SessionContextProvider, OidcSessionProvider, useSession } from './session.jsx';
import { demoSession, isDemoMode } from './demo.js';
import './tokens.css';

const CAUGHT_UP_NOTICE_MS = 6000;

// Підписка на потік подій: первинне завантаження, WebSocket і довантаження.
function useEventStream() {
  const session = useSession();
  const isAuthenticated = Boolean(session && session.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    store.dispatch(loadStart());
    load()
      .then((records) => store.dispatch(loadSuccess(records)))
      .catch((error) => store.dispatch(loadError(error.message || 'Не вдалося завантажити події')));

    const stopStream = stream({
      onStatus(status) {
        store.dispatch(connectionChanged(status));
      },
      onRecord(record) {
        store.dispatch(recordReceived(record));
      },
      onCatchup(records) {
        store.dispatch(catchupReceived(records));
        window.setTimeout(() => store.dispatch(clearCaughtUp()), CAUGHT_UP_NOTICE_MS);
      },
    });

    return () => {
      stopStream();
      store.dispatch(resetStore());
    };
  }, [isAuthenticated]);
}

function AppRoot() {
  const session = useSession();
  useEventStream();

  const handleSignOut = () => {
    if (isDemoMode()) {
      window.location.reload();
      return;
    }
    store.dispatch(resetStore());
    if (session && session.signinRedirect) {
      signOut();
    }
  };

  return <App onSignOut={handleSignOut} />;
}

const onSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  const demo = isDemoMode();

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        {demo ? (
          <SessionContextProvider value={demoSession()}>
            <AppRoot />
          </SessionContextProvider>
        ) : (
          <AuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
            <OidcSessionProvider>
              <AppRoot />
            </OidcSessionProvider>
          </AuthProvider>
        )}
      </Provider>
    </React.StrictMode>
  );
}
