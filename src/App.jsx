import React, { useState } from 'react';
import './tokens.css';
import { AppHeader } from './layout/AppHeader';
import { SideNav } from './layout/SideNav';
import { RequireAuth } from './ui/RequireAuth';
import { PlaceholderView } from './views/PlaceholderView';
import { EventsView } from './views/EventsView';
import { useSession, sessionProfile } from './session';
import { useEventCounters, useConnectionStatus } from './hooks';
import { isDemoMode } from './demo';

const NAV_ITEMS = [
  { id: 'picture', label: 'Track picture' },
  { id: 'zones', label: 'Zones' },
  { id: 'events', label: 'Events' },
  { id: 'tasking', label: 'Tasking' },
  { id: 'fusion', label: 'Fusion' },
];

// Каркас робочого місця: заголовок, навігація та поточне представлення.
// Доступ до робочої області закритий шлюзом автентифікації (В-9).
export const App = ({ onSignOut }) => {
  const session = useSession();

  return (
    <RequireAuth auth={session}>
      <Workspace session={session} onSignOut={onSignOut} />
    </RequireAuth>
  );
};

const Workspace = ({ session, onSignOut }) => {
  const profile = sessionProfile(session);
  const counters = useEventCounters();
  const { connection, caughtUp } = useConnectionStatus();
  const [activeNav, setActiveNav] = useState('events');

  const navItems = NAV_ITEMS.map((item) =>
    item.id === 'events' ? { ...item, count: counters.unack } : item
  );

  return (
    <div className="argus-app">
      <AppHeader
        profile={profile}
        connection={connection}
        onSignOut={onSignOut}
        demo={isDemoMode()}
      />

      <div className="argus-app__body">
        <SideNav items={navItems} active={activeNav} onChange={setActiveNav} />

        <main className="argus-app__main">
          {activeNav === 'events' ? (
            <EventsView profile={profile} connection={connection} caughtUp={caughtUp} />
          ) : (
            <PlaceholderView
              title={NAV_ITEMS.find((item) => item.id === activeNav)?.label || activeNav}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
