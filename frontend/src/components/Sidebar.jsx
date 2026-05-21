import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiLayout,
  FiSliders,
  FiClock,
  FiStar,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiLayout },
    { path: '/workspace', label: 'Workspace', icon: FiSliders },
    { path: '/history', label: 'History', icon: FiClock },
    { path: '/favorites', label: 'Favorites', icon: FiStar },
    { path: '/profile', label: 'Profile', icon: FiUser },
    { path: '/settings', label: 'Settings', icon: FiSettings }
  ];

  const sidebarClass = `h-screen sticky top-0 flex flex-col transition-all duration-300 border-r ${
    collapsed ? 'w-20' : 'w-64'
  } ${
    theme === 'dark'
      ? 'bg-[#0b0f19] border-white/5 text-slate-300'
      : 'bg-white border-slate-200 text-slate-700'
  }`;

  return (
    <aside className={sidebarClass}>
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-inherit">
        {!collapsed && (
          <span className="font-extrabold text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-neonBlue to-neonPurple">
            CORE PANEL
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg hover:bg-slate-800/20 dark:hover:bg-white/5 transition-colors mx-auto ${
            collapsed ? 'mt-2' : ''
          }`}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-neonBlue/10 to-neonPurple/10 text-neonBlue border-l-2 border-neonBlue'
                    : 'hover:bg-slate-800/10 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="text-lg group-hover:scale-105 transition-transform" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer User Info */}
      <div className="p-4 border-t border-inherit space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full shrink-0 bg-gradient-to-tr from-neonBlue to-neonPurple flex items-center justify-center text-white font-extrabold shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold truncate dark:text-white text-slate-800">{user?.name}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <FiLogOut className="text-lg" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
