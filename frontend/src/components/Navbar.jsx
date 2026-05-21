import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiCpu, FiMenu, FiX, FiLogOut, FiUser, FiLayout } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      theme === 'dark' ? 'glass-navbar text-white' : 'glass-navbar-light text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-neonBlue to-neonPurple flex items-center justify-center glow-blue transition-transform group-hover:scale-105">
              <FiCpu className="text-white text-lg animate-pulse" />
            </div>
            <span className="text-lg font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-neonBlue via-neonPurple to-neonPink">
              AETHER<span className="text-slate-800 dark:text-white">SUMMARY</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-semibold hover:text-neonBlue transition-colors ${
                isActive('/') ? 'text-neonBlue' : 'text-slate-400 dark:text-slate-300'
              }`}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-semibold hover:text-neonBlue transition-colors flex items-center gap-1.5 ${
                    isActive('/dashboard') ? 'text-neonBlue' : 'text-slate-400 dark:text-slate-300'
                  }`}
                >
                  <FiLayout className="text-xs" /> Dashboard
                </Link>
                <Link
                  to="/workspace"
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:opacity-90 glow-blue transition-all"
                >
                  Workspace
                </Link>
                {/* Theme Selector */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-800/40 dark:bg-white/5 border border-slate-700/50 dark:border-white/10 hover:text-neonBlue transition-colors"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <FiSun className="text-orange-400" /> : <FiMoon className="text-slate-600" />}
                </button>
                {/* User Dropdown / Profile Button */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-800/40 dark:bg-white/5 border border-slate-700/50 dark:border-white/10 hover:border-neonBlue transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-neonPurple to-neonPink flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-300 max-w-[80px] truncate">{user.name}</span>
                </Link>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                  title="Logout"
                >
                  <FiLogOut />
                </button>
              </>
            ) : (
              <>
                {/* Theme Selector */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-800/40 dark:bg-white/5 border border-slate-700/50 dark:border-white/10 hover:text-neonBlue transition-colors"
                >
                  {theme === 'dark' ? <FiSun className="text-orange-400" /> : <FiMoon className="text-slate-600" />}
                </button>
                <Link to="/login" className="text-sm font-semibold hover:text-neonBlue transition-colors text-slate-400 dark:text-slate-300">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:opacity-90 glow-blue transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger trigger */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/40 dark:bg-white/5 border border-slate-700/50 dark:border-white/10 hover:text-neonBlue transition-colors"
            >
              {theme === 'dark' ? <FiSun className="text-orange-400" /> : <FiMoon className="text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white"
            >
              {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={`md:hidden px-4 pt-2 pb-4 space-y-3 transition-colors ${
          theme === 'dark' ? 'bg-[#090D16] border-b border-white/10' : 'bg-slate-50 border-b border-black/10'
        }`}>
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
              >
                Dashboard
              </Link>
              <Link
                to="/workspace"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-neonBlue to-neonPurple text-white"
              >
                Workspace
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5 flex items-center gap-2"
              >
                <FiUser /> Profile
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-neonBlue to-neonPurple text-white"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
