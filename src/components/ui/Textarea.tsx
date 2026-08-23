import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, className = '', rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    const describedBy = [
      props['aria-describedby'],
      error ? errorId : helperText ? helperId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-[#172033] tracking-wide">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-[2px] border bg-white px-3.5 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#007d6f] focus:border-transparent disabled:bg-slate-50 ${
            error ? 'border-rose-400 focus:ring-rose-500' : 'border-[#E2E8F0]'
          } ${className}`}
          {...props}
          aria-describedby={describedBy}
          aria-invalid={props['aria-invalid'] ?? Boolean(error)}
        />
        {error ? (
          <p id={errorId} className="text-xs text-rose-600 font-medium" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
