import React from 'react';

interface Props { name: string; size?: 'sm' | 'md' | 'lg'; }

const colors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-teal-500'];

export const Avatar: React.FC<Props> = ({ name, size = 'md' }) => {
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';
  return (
    <div className={`${color} ${sizeClass} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
};
