import React from 'react';
import './layout.css';
import { NavItem } from '../ui/NavItem';

// Бічна навігація пульта. На вузьких екранах перетворюється на горизонтальну смугу.
export const SideNav = ({ items = [], active, onChange }) => {
  return (
    <nav className="argus-nav" aria-label="Розділи пульта">
      <div className="argus-nav__title">WATCH</div>
      {items.map((item) => (
        <NavItem
          key={item.id}
          label={item.label}
          count={item.count}
          active={active === item.id}
          href={`#${item.id}`}
          onClick={(event) => {
            event.preventDefault();
            onChange(item.id);
          }}
        />
      ))}
    </nav>
  );
};

export default SideNav;
