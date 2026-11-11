import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full rounded-lg bg-slate-950/90 border border-slate-800 px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors font-mono leading-relaxed resize-y ${className}`}
        {...props}
      />
      {helperText && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
};

