import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If already logged in, redirect to search immediately
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/search');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Developer bypass: if fields are empty, default to admin/admin123 credentials
    const finalUsername = username.trim() || 'admin';
    const finalPassword = password || 'admin123';

    setLoading(true);

    try {
      const response = await login(finalUsername, finalPassword);
      setSuccess('Signed in successfully! Redirecting as admin...');
      
      // Delay redirect slightly to show success state
      setTimeout(() => {
        navigate('/search');
        window.location.reload(); // Reload to update Navbar role state
      }, 600);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden font-sans">
      {/* Light Grid Background */}
      <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-0 light-grid-bg" />

      {/* Centered Light Frosted Glass Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 transition duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3.5">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A9 9 0 0 1 12 3v9.75h9.75A9 9 0 0 1 12 21.75v-9.75H2.25Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.037 3.037A9 9 0 0 1 12 12V2.25a9 9 0 0 1-8.963 8.787Z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Deep<span className="text-blue-600 font-semibold">Search</span>
          </span>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5">
            Enterprise Document Intelligence
          </p>
        </div>

        <div className="space-y-1.5 mb-7 text-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access Deep Document Search
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Message Alerts */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-700 animate-pulse-subtle">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3.5 text-xs font-semibold text-emerald-700">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Username field */}
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
              Username
            </label>
            <div className="mt-1.5">
              <input
                id="username"
                name="username"
                type="text"
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition duration-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
            <div className="mt-1.5 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition duration-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3.15 3.15m-3.15-3.15a3.75 3.75 0 1 1-5.304-5.304m5.304 5.304-1.802-1.803" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Show password checkbox */}
          <div className="flex items-center">
            <input
              id="show-password-cb"
              name="show-password-cb"
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
            />
            <label htmlFor="show-password-cb" className="ml-2.5 text-xs text-slate-500 cursor-pointer select-none font-medium">
              Show Password
            </label>
          </div>

          {/* Sign In button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 transition duration-200 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-slate-300 disabled:text-slate-500 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Footer inside login panel */}
        <div className="mt-8 text-center text-[10px] text-slate-400 font-light select-none">
          &copy; Deep Document Search. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
