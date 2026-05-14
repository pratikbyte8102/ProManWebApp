import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-brand-orange hover:bg-brand-orange-hover text-white',
  secondary: 'border border-navy-800 text-navy-800 hover:bg-navy-50 bg-white',
  ghost: 'text-gray-600 hover:bg-gray-100 bg-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

export const Button: React.FC<Props> = ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`inline-flex items-center gap-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
    {children}
  </button>
);
