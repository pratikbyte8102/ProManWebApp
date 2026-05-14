import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Avatar } from '../ui/Avatar';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-navy-900 flex items-center px-4 gap-4 z-40 flex-shrink-0">
      <Link to="/projects" className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 bg-brand-orange rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">PM</span>
        </div>
        <span className="text-white font-bold text-base hidden sm:block">ProMan</span>
      </Link>
      <div className="flex-1" />
      <NotificationDropdown />
      <div className="relative">
        <button onClick={() => setUserMenuOpen(v => !v)} className="flex items-center gap-2 text-gray-300 hover:text-white">
          {user && <Avatar name={user.displayName} size="sm" />}
          <span className="text-sm hidden sm:block">{user?.displayName}</span>
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border py-1 w-48 z-50">
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-semibold text-gray-800">{user?.displayName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={() => { logout(); window.location.href = '/login'; }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50">
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
