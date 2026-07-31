import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helpText, className = '', id, ...props }, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);
  
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label htmlFor={inputId} className="form-label">{label} {props.required && <span className="text-red-500">*</span>}</label>}
      <input
        ref={ref}
        id={inputId}
        className={`form-input ${error ? 'border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {helpText && !error && <p className="text-gray-500 text-xs mt-1">{helpText}</p>}
    </div>
  );
});
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, className = '', children, id, ...props }, ref) => {
  const selectId = id || Math.random().toString(36).substring(7);

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label htmlFor={selectId} className="form-label">{label} {props.required && <span className="text-red-500">*</span>}</label>}
      <select
        ref={ref}
        id={selectId}
        className={`form-select ${error ? 'border-red-500' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
