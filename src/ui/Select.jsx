import React, { useId } from 'react';
import './ui.css';

// Випадаючий список у стилі Carbon: підпис, поле, власна стрілка.
export const Select = ({
  id,
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={`argus-field ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="argus-field__label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className="argus-select__input"
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
