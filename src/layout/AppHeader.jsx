import React from 'react';
import './layout.css';
import { Button } from '../ui/Button';
import { ConnectionBadge } from './ConnectionBadge';

// Верхній заголовок робочого місця: бренд, стан потоку, профіль і вихід.
export const AppHeader = ({ profile, connection, onSignOut, demo = false }) => {
  const isOperator = profile.role === 'operator';

  return (
    <header className="argus-header">
      <div className="argus-header__brand">
        ARGUS <span>· SENTINEL</span>
        <span className="argus-header__shift">
          {demo ? 'ДЕМОНСТРАЦІЙНИЙ РЕЖИМ' : 'WATCH FLOOR · SHIFT B'}
        </span>
      </div>

      <div className="argus-header__tools">
        <ConnectionBadge connection={connection} />

        <div className="argus-header__user">
          <span
            className={`argus-header__role argus-header__role--${isOperator ? 'operator' : 'analyst'}`}
          >
            {profile.role}
          </span>
          <span className="argus-header__username" title={profile.displayName}>
            {profile.username}
          </span>
        </div>

        <Button variant="secondary" size="sm" onClick={onSignOut}>
          Вийти
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
