import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;
    const errorId = `${checkboxId}-error`;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={checkboxId} className="flex items-start gap-2.5 cursor-pointer text-sm text-[#172033] select-none">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            className={`mt-0.5 h-4 w-4 rounded border-[#E2E8F0] text-[#1D4E89] focus:ring-[#1D4E89] cursor-pointer ${className}`}
            {...props}
            aria-describedby={error ? errorId : props['aria-describedby']}
            aria-invalid={props['aria-invalid'] ?? Boolean(error)}
          />
          <span className="leading-snug">{label}</span>
        </label>
        {error && (
          <p id={errorId} className="text-xs text-rose-600 font-medium ml-6.5" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
