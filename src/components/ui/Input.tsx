import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 
          bg-surface-800 border border-surface-600 rounded-lg 
          text-surface-100 placeholder-surface-500
          focus:outline-none focus:border-onto-500 focus:ring-1 focus:ring-onto-500
          transition-all duration-200
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-400 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-3 py-2 
          bg-surface-800 border border-surface-600 rounded-lg 
          text-surface-100 placeholder-surface-500
          focus:outline-none focus:border-onto-500 focus:ring-1 focus:ring-onto-500
          transition-all duration-200 resize-none
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-400 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 
          bg-surface-800 border border-surface-600 rounded-lg 
          text-surface-100
          focus:outline-none focus:border-onto-500 focus:ring-1 focus:ring-onto-500
          transition-all duration-200 cursor-pointer
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
