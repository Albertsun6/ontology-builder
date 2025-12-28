import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
}

const variantStyles = {
  primary: 'bg-onto-600 hover:bg-onto-500 text-white border-transparent',
  secondary: 'bg-surface-700 hover:bg-surface-600 text-surface-200 border-surface-600',
  danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30',
  ghost: 'bg-transparent hover:bg-surface-700 text-surface-400 hover:text-surface-200 border-transparent',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-lg border
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
