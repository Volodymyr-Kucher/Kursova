import React, { useState } from 'react';
import { Select } from './Select';

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'Усі рівні' },
  { value: 'high', label: 'High / Critical' },
  { value: 'medium', label: 'Medium / Warning' },
  { value: 'low', label: 'Low / Info' },
];

export const Default = () => {
  const [value, setValue] = useState('all');
  return (
    <Select
      id="story-severity"
      label="Важливість"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      options={SEVERITY_OPTIONS}
    />
  );
};

export const Disabled = () => (
  <Select
    id="story-severity-disabled"
    label="Важливість"
    value="all"
    onChange={() => {}}
    options={SEVERITY_OPTIONS}
    disabled
  />
);
