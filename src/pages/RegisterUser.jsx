import React, { useState } from 'react';
import { registerUser } from '../api/users';

const RegisterUser = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validateForm = () => {
    if (!username.trim() || !fullName.trim() || !password) {
      return 'All fields are required.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setSubmitting(true);

    try {
      const response = await registerUser(username, fullName, password);
      setMessage({
        type: 'success',
        text: `User "${username}" registered successfully! Role assigned: user.`,
      });
      // Clear form inputs
      setUsername('');
      setFullName('');
      setPassword('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Registration failed. Check backend configuration.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 lg:px-8 flex-1 flex flex-col justify-center">
      {/* Page header */}
      <div className="text-center max-w-sm mx-auto mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Register New User
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 font-sans">
          Provision credential accounts for new internal employees.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Notification Messages */}
          {message.text && (
            <div className={`rounded-lg p-3.5 text-xs font-semibold border ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          {/* Full Name Input */}
          <div>
            <label htmlFor="full-name" className="block text-xs font-semibold text-slate-700">
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              required
              disabled={submitting}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Username Input */}
          <div>
            <label htmlFor="reg-username" className="block text-xs font-semibold text-slate-700">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              required
              disabled={submitting}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jdoe"
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700">
              Initial Password
            </label>
            <input
              id="reg-password"
              type="password"
              required
              disabled={submitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
            {/* Dynamic Password validation checklist */}
            <div className="mt-2.5 space-y-1 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-[10px]">
                {password.length >= 8 ? (
                  <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-1.5 mr-1" />
                )}
                <span className={password.length >= 8 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                  Minimum 8 characters length constraint
                </span>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !username || !fullName || password.length < 8}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {submitting ? 'Registering...' : 'Register User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;
