import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<Props> = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      {...props}
      className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);
