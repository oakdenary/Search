import React, { useState, useEffect } from 'react';
import { getUsers, getUserAccess, grantAccess, revokeAccess } from '../api/users';
import { getFolders } from '../api/folders';

const FolderAccess = () => {
  const [users, setUsers] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Selection states for form grant/revoke
  const [formFolderId, setFormFolderId] = useState('');
  
  // Current permissions of selected user
  const [userPermissions, setUserPermissions] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load users and folders on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const usersList = await getUsers();
        const foldersList = await getFolders();
        
        setUsers(Array.isArray(usersList) ? usersList : []);
        setFolders(Array.isArray(foldersList) ? foldersList : []);
        
        // Auto-select first user if available
        const safeUsersList = Array.isArray(usersList) ? usersList : [];
        if (safeUsersList.length > 0) {
          setSelectedUserId(safeUsersList[0].id);
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to retrieve administrative records.' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Fetch permissions when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      loadUserPermissions(selectedUserId);
    } else {
      setUserPermissions([]);
    }
  }, [selectedUserId]);

  const loadUserPermissions = async (userId) => {
    try {
      const folderIds = await getUserAccess(userId);
      setUserPermissions(Array.isArray(folderIds) ? folderIds : []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load user permissions.' });
    }
  };

  const handleGrantAccess = async (e) => {
    if (e) e.preventDefault();
    const folderId = formFolderId;
    
    if (!selectedUserId || !folderId) {
      setMessage({ type: 'error', text: 'Please select both a User and a Folder.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await grantAccess(selectedUserId, folderId);
      setMessage({ type: 'success', text: 'Access granted successfully!' });
      setFormFolderId(''); // Clear selection
      await loadUserPermissions(selectedUserId); // Reload list
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to grant folder permission.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAccess = async (e) => {
    if (e) e.preventDefault();
    const folderId = formFolderId;
    
    if (!selectedUserId || !folderId) {
      setMessage({ type: 'error', text: 'Please select both a User and a Folder.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await revokeAccess(selectedUserId, folderId);
      setMessage({ type: 'success', text: 'Access revoked successfully!' });
      setFormFolderId(''); // Clear selection
      await loadUserPermissions(selectedUserId); // Reload list
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to revoke folder permission.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInlineAction = async (folderId, isGranted) => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (isGranted) {
        await revokeAccess(selectedUserId, folderId);
        setMessage({ type: 'success', text: 'Access revoked successfully!' });
      } else {
        await grantAccess(selectedUserId, folderId);
        setMessage({ type: 'success', text: 'Access granted successfully!' });
      }
      await loadUserPermissions(selectedUserId); // Reload list
    } catch (err) {
      setMessage({ type: 'error', text: 'Permission change failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedUser = () => {
    return users.find((u) => u.id === selectedUserId);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-8 flex-1">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Folder Access Management
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 font-sans">
          Manage folder visibility policies for corporate users.
        </p>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Grant/Revoke Master Selector Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                Quick Action Panel
              </h2>
              
              <div className="space-y-4">
                {/* Select User */}
                <div>
                  <label htmlFor="user-select" className="block text-xs font-semibold text-slate-700">
                    Selected User
                  </label>
                  <select
                    id="user-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.username})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Folder */}
                <div>
                  <label htmlFor="folder-select" className="block text-xs font-semibold text-slate-700">
                    Select Target Folder
                  </label>
                  <select
                    id="folder-select"
                    value={formFolderId}
                    onChange={(e) => setFormFolderId(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                  >
                    <option value="">-- Select Folder --</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleGrantAccess}
                    disabled={submitting || !formFolderId || !selectedUserId}
                    className="rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    Grant Access
                  </button>
                  <button
                    type="button"
                    onClick={handleRevokeAccess}
                    disabled={submitting || !formFolderId || !selectedUserId}
                    className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
                  >
                    Revoke Access
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Messages */}
            {message.text && (
              <div className={`rounded-xl border p-4 text-xs font-semibold ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message.text}
              </div>
            )}
          </div>

          {/* User Folder Permissions List Table Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Permissions Directory
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authorized folders for user:{' '}
                    <span className="font-semibold text-slate-700">
                      {getSelectedUser()?.fullName || 'Selected User'}
                    </span>
                  </p>
                </div>
                
                {getSelectedUser()?.role === 'admin' && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 uppercase border border-blue-100">
                    Bypasses Restrictions (Admin)
                  </span>
                )}
              </div>

              {/* Folder list Table */}
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-500">
                  <thead className="bg-slate-50/20 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-5 py-3">Folder Name</th>
                      <th scope="col" className="px-5 py-3 hidden sm:table-cell">Description</th>
                      <th scope="col" className="px-5 py-3">Access Status</th>
                      <th scope="col" className="px-5 py-3 text-right">Toggle Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {folders.map((f) => {
                      const isGranted = userPermissions.includes(f.id);
                      const isUserAdmin = getSelectedUser()?.role === 'admin';
                      return (
                        <tr key={f.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                            {f.name}
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell text-xs max-w-xs truncate">
                            {f.description}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            {isUserAdmin ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                Granted (Admin Override)
                              </span>
                            ) : isGranted ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                Active Access
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400">
                                No Access
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={submitting || isUserAdmin}
                              onClick={() => handleInlineAction(f.id, isGranted)}
                              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                isUserAdmin
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : isGranted
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100/70'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100/70'
                              }`}
                            >
                              {isGranted ? 'Revoke' : 'Grant'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderAccess;
