import React, { createContext, useContext } from 'react';
import { useAuth } from 'react-oidc-context';

// Єдине джерело відомостей про сесію для всього інтерфейсу.
// Дозволяє однаково працювати зі справжнім постачальником ідентичності
// SENTINEL і з демонстраційною сесією без сервера.
const SessionContext = createContext(null);

export function SessionContextProvider({ value, children }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// Місток між react-oidc-context та внутрішнім контекстом сесії.
export function OidcSessionProvider({ children }) {
  const auth = useAuth();
  return <SessionContext.Provider value={auth}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession must be used inside a session provider');
  }
  return session;
}

export function sessionProfile(session) {
  const profile = session?.user?.profile;
  return {
    username: profile?.preferred_username || profile?.name || 'operator',
    role: profile?.role === 'analyst' ? 'analyst' : 'operator',
    displayName: profile?.name || profile?.preferred_username || 'Черговий оператор',
  };
}
