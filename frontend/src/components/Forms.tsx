import React, { forwardRef, useId } from 'react';
import { AlertCircle, Info } from 'lucide-react';

/* ----------------------------------
   FormField (Wrapper)
----------------------------------- */
export interface FormFieldProps {
  id?: string;
  label?: React.ReactNode;
  required?: boolean;
  error?: React.ReactNode;
  helpText?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ id, label, required, error, helpText, children, className = '' }) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="form-label text-label">
          {label} {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="form-error" role="alert" id={id ? `${id}-error` : undefined}>
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="form-help" id={id ? `${id}-help` : undefined}>
          <Info size={12} aria-hidden="true" style={{ display: 'inline', marginRight: 4 }} />
          {helpText}
        </p>
      )}
    </div>
  );
};

/* ----------------------------------
   Input
----------------------------------- */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helpText, className = '', id, required, 'aria-describedby': ariaDescribedby, ...props }, ref) => {
  const defaultId = useId();
  const inputId = id || defaultId;
  const describedBy = error ? `${inputId}-error` : helpText ? `${inputId}-help` : ariaDescribedby;

  return (
    <FormField id={inputId} label={label} error={error} helpText={helpText} required={required} className={className}>
      <input
        ref={ref}
        id={inputId}
        className={`form-control ${error ? 'has-error' : ''}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...props}
      />
    </FormField>
  );
});
Input.displayName = 'Input';

/* ----------------------------------
   Select
----------------------------------- */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, helpText, className = '', children, id, required, 'aria-describedby': ariaDescribedby, ...props }, ref) => {
  const defaultId = useId();
  const selectId = id || defaultId;
  const describedBy = error ? `${selectId}-error` : helpText ? `${selectId}-help` : ariaDescribedby;

  return (
    <FormField id={selectId} label={label} error={error} helpText={helpText} required={required} className={className}>
      <select
        ref={ref}
        id={selectId}
        className={`form-control form-select ${error ? 'has-error' : ''}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
});
Select.displayName = 'Select';

/* ----------------------------------
   Textarea
----------------------------------- */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, helpText, className = '', id, required, 'aria-describedby': ariaDescribedby, ...props }, ref) => {
  const defaultId = useId();
  const textareaId = id || defaultId;
  const describedBy = error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : ariaDescribedby;

  return (
    <FormField id={textareaId} label={label} error={error} helpText={helpText} required={required} className={className}>
      <textarea
        ref={ref}
        id={textareaId}
        className={`form-control form-textarea ${error ? 'has-error' : ''}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...props}
      />
    </FormField>
  );
});
Textarea.displayName = 'Textarea';

/* ----------------------------------
   Checkbox
----------------------------------- */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, error, className = '', id, required, 'aria-describedby': ariaDescribedby, ...props }, ref) => {
  const defaultId = useId();
  const checkboxId = id || defaultId;
  const describedBy = error ? `${checkboxId}-error` : ariaDescribedby;

  return (
    <div className={`form-group ${className}`.trim()} style={{ marginBottom: '8px' }}>
      <label htmlFor={checkboxId} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.6 : 1 }}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
          {...props}
        />
        <span className="text-body-small" style={{ color: 'var(--color-text-primary)', userSelect: 'none' }}>
          {label}
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert" id={`${checkboxId}-error`} style={{ marginLeft: '24px' }}>
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
