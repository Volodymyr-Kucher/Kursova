import React, { useId } from 'react';
import './ui.css';

export const Field = ({
  id,
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  error,
  helper,
  disabled = false,
  type = 'text',
  className = '',
  inputProps = {},
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const describedBy = [
    error ? errorId : null,
    helper && !error ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`argus-field ${error ? 'argus-field--error' : ''} ${className}`.trim()}
      {...props}
    >
      {label && (
        <label htmlFor={inputId} className="argus-field__label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className="argus-field__input"
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {error && (
        <span id={errorId} className="argus-field__error" role="alert">
          {error}
        </span>
      )}
      {helper && !error && (
        <span id={helperId} className="argus-field__helper">
          {helper}
        </span>
      )}
    </div>
  );
};

