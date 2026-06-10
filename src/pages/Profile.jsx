import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/auth';
import { mockDb } from '../api/client';

const Profile = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const currentUser = mockDb.getCurrentUser();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Password update failed. Verify current credentials.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
      : 'U';
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8 flex-1">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          User Profile
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 font-sans">
          Manage your account configurations and change credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* User Details Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            {/* Initial circle avatar */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600 ring-4 ring-blue-500/10 mb-4 select-none">
              {getInitials(currentUser?.fullName)}
            </div>

            <h2 className="font-bold text-slate-800 text-lg">{currentUser?.fullName || 'User'}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">@{currentUser?.username || 'username'}</p>

            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 capitalize border border-blue-100">
                {currentUser?.role || 'user'}
              </span>
            </div>

            <div className="border-t border-slate-100 mt-6 pt-5">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
              >
                Sign Out of System
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Card Form */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Change Account Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              
              {/* Message Alerts */}
              {message.text && (
                <div className={`rounded-lg p-3.5 text-xs font-semibold border ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label htmlFor="curr-pass" className="block text-xs font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  id="curr-pass"
                  type="password"
                  required
                  disabled={submitting}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new-pass" className="block text-xs font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  id="new-pass"
                  type="password"
                  required
                  disabled={submitting}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirm-pass" className="block text-xs font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  id="confirm-pass"
                  type="password"
                  required
                  disabled={submitting}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting || !currentPassword || !newPassword || !confirmPassword || newPassword.length < 8}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
