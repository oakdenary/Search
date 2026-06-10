import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const fullName = localStorage.getItem('fullName') || 'User';

  if (!token) return null; // Don't show navbar if user is not logged in

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    // Force a small page refresh/navigation to reset route state
    navigate('/');
    window.location.reload();
  };

  // Define nav links based on role
  const links = [
    { path: '/search', label: 'Search' },
    { path: '/upload', label: 'Upload' },
  ];

  if (role === 'admin') {
    links.push(
      { path: '/folder-access', label: 'Folder Access' },
      { path: '/folders', label: 'Folder Management' },
      { path: '/register-user', label: 'Register User' }
    );
  }

  // Profile link is shared
  links.push({ path: '/profile', label: 'Profile' });

  // Get user initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Typographic Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/search')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A9 9 0 0 1 12 3v9.75h9.75A9 9 0 0 1 12 21.75v-9.75H2.25Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.037 3.037A9 9 0 0 1 12 12V2.25a9 9 0 0 1-8.963 8.787Z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
              Deep<span className="text-blue-600 font-semibold">Search</span>
            </span>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex md:items-center md:gap-x-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right: User profile and logout (Desktop) */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-2 ring-slate-200/50">
                {getInitials(fullName)}
              </div>
              <span className="text-sm font-medium text-slate-700">{fullName}</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600 hover:border-red-200"
            >
              Sign Out
            </button>
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pb-4 pt-2 shadow-inner">
          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex items-center px-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                {getInitials(fullName)}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-slate-800">{fullName}</div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={handleLogout}
                className="block w-full rounded-md bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
