import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  prefixIcon?: React.ReactNode;
  suffixText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, prefixIcon, suffixText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label">
            <span>
              {label}
              {required && <span className="required-star">*</span>}
            </span>
          </label>
        )}
        <div className={prefixIcon || suffixText ? 'input-with-icon-wrapper' : undefined}>
          {prefixIcon && <span className="input-prefix-icon">{prefixIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            className={`form-input ${error ? 'error' : ''} ${className}`.trim()}
            required={required}
            {...props}
          />
          {suffixText && <span className="input-suffix-text">{suffixText}</span>}
        </div>
        {error && <span className="form-error-msg">{error}</span>}
        {hint && !error && <span className="form-hint">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
