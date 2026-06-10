import React, { useState, useEffect } from 'react';
import { getFolders, createFolder } from '../api/folders';

const FolderManagement = () => {
  const [folders, setFolders] = useState([]);
  const [name, setName] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load existing folders on mount
  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to retrieve folder directory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    setSubmitting(true);

    try {
      // Default description matches the folder name to fit existing API compatibility
      const result = await createFolder(name.trim(), `Directory for ${name.trim()} documents.`);
      setMessage({ type: 'success', text: result.message || 'Folder created successfully!' });
      setName('');
      await loadFolders(); // Refresh existing folders list
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create folder.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-8 flex-1 flex flex-col justify-center items-center">
      
      {/* Create Folder Form Card */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 mb-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Folder Management
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-sans">
            Create folder locations for document classification and user access control.
          </p>
        </div>
        
        <div>
          <label htmlFor="folder-name" className="sr-only">
            Folder Name
          </label>
          <input
            id="folder-name"
            type="text"
            required
            disabled={submitting}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter folder name..."
            className="block w-full text-center rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-450 shadow-sm transition duration-200 hover:border-slate-350 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {submitting ? 'Creating...' : 'Create Folder'}
        </button>

        {/* Notification alert */}
        {message.text && (
          <div className={`rounded-xl border p-3.5 text-center text-xs font-semibold ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {message.text}
          </div>
        )}
      </form>

      {/* Existing Folders List Grid */}
      <div className="w-full max-w-3xl border-t border-slate-200 pt-10">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">
          Available Directories ({folders.length})
        </h2>

        {loading ? (
          <div className="flex h-20 items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : folders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {folders.map((f) => (
              <div 
                key={f.id} 
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-200 transition duration-200 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 truncate">{f.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase truncate mt-0.5">{f.id}</p>
                </div>
                <span className="shrink-0 rounded bg-slate-50 border border-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500 tracking-wide">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-200 bg-white rounded-2xl p-6">
            <p className="text-xs text-slate-500">No folder directories exist yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderManagement;
