import React, { useState } from 'react';
import { NavItem } from './NavItem';

export const Default = () => (
  <div style={{ width: 256, backgroundColor: 'var(--color-page)' }}>
    <NavItem label="Track picture" count={42} />
  </div>
);

export const Active = () => (
  <div style={{ width: 256, backgroundColor: 'var(--color-page)' }}>
    <NavItem label="Zones" count={7} active />
  </div>
);

export const NavList = () => {
  const [activeTab, setActiveTab] = useState('events');

  const items = [
    { id: 'picture', label: 'Track picture', count: 48 },
    { id: 'zones', label: 'Zones', count: 7 },
    { id: 'events', label: 'Events', count: 12 },
    { id: 'tasking', label: 'Tasking', count: 3 },
    { id: 'fusion', label: 'Fusion', count: 0 },
  ];

  return (
    <nav
      style={{
        width: 256,
        padding: 'var(--space-04) 0',
        backgroundColor: 'var(--color-page)',
        borderRight: '1px solid var(--color-border-subtle)',
      }}
      aria-label="Головна навігація"
    >
      <div
        style={{
          padding: '0 var(--space-05)',
          marginBottom: 'var(--space-03)',
          fontSize: 'var(--label-01-size)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.32px',
        }}
      >
        ARGUS Секції
      </div>
      {items.map((item) => (
        <NavItem
          key={item.id}
          label={item.label}
          count={item.count}
          active={activeTab === item.id}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab(item.id);
          }}
        />
      ))}
    </nav>
  );
};

