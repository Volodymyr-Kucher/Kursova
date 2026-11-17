import React from 'react';
import './events.css';
import { Field } from '../../ui/Field';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { SEVERITY_OPTIONS, STATUS_OPTIONS } from './filters';

// Смуга відбору: пошук за текстом, рівень важливості, статус опрацювання (В-5).
export const EventsToolbar = ({
  query,
  onQueryChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
  onReset,
  disabled = false,
  isFiltered = false,
}) => {
  return (
    <div className="argus-events__toolbar" role="search">
      <Field
        id="events-search"
        label="Пошук (назва, трек, зона, ID)"
        placeholder="Наприклад, trk-0042"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        disabled={disabled}
      />

      <Select
        id="events-severity"
        label="Важливість"
        value={severity}
        onChange={(event) => onSeverityChange(event.target.value)}
        options={SEVERITY_OPTIONS}
        disabled={disabled}
      />

      <Select
        id="events-status"
        label="Статус"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        options={STATUS_OPTIONS}
        disabled={disabled}
      />

      {isFiltered && (
        <div className="argus-events__toolbar-actions">
          <Button variant="ghost" size="sm" onClick={onReset} disabled={disabled}>
            Скинути фільтри
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsToolbar;
