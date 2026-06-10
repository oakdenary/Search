import React, { useState, useEffect, useRef } from 'react';
import { uploadDocument } from '../api/upload';
import { getFolders } from '../api/folders';
import { getUserAccess } from '../api/users';
import { mockDb } from '../api/client';

const Upload = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState('');
  const [folders, setFolders] = useState([]);
  
  // Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  const currentUser = mockDb.getCurrentUser();

  // Load allowed folders for upload
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const resFolders = await getFolders();
        const allFolders = Array.isArray(resFolders) ? resFolders : [];
        if (currentUser && currentUser.role !== 'admin') {
          const allowedFolderIds = await getUserAccess(currentUser.id);
          const allowedFolderIdsArray = Array.isArray(allowedFolderIds) ? allowedFolderIds : [];
          setFolders(allFolders.filter((f) => allowedFolderIdsArray.includes(f.id)));
        } else {
          setFolders(allFolders);
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to populate folder list.' });
      }
    };
    loadFolders();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setMessage({ type: '', text: '' });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!file) {
      setMessage({ type: 'error', text: 'Please select a document file first.' });
      return;
    }
    if (!folder) {
      setMessage({ type: 'error', text: 'Please choose a target destination folder.' });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadDocument(file, folder, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      setMessage({ type: 'success', text: result.message || 'File uploaded successfully!' });
      setFile(null); // Clear selected file on success
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'File upload failed. Check connection parameters.' });
    } finally {
      setUploading(false);
    }
  };

  // Human-readable file size conversion
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-8 flex-1 flex flex-col justify-center">
      <div className="w-full">
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Upload Documents
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-sans max-w-md mx-auto">
            Upload unstructured text files or documents. They will be parsed and indexed into OpenSearch.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleUpload} className="space-y-6">
          
          {/* Message alerts */}
          {message.text && (
            <div className={`rounded-lg p-3.5 text-xs font-semibold border ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          {/* Folder selection dropdown */}
          <div>
            <label htmlFor="folder-select" className="block text-sm font-semibold text-slate-700">
              Target Folder Destination
            </label>
            <div className="mt-1.5">
              <select
                id="folder-select"
                disabled={uploading}
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm transition duration-200 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
              >
                <option value="" disabled>-- Select Destination --</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.description})
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Documents are quarantined under these folders and only searchable by authorized users.
            </p>
          </div>

          {/* File input and dropzone selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Document Attachment
            </label>

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/30' 
                    : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.json,.md"
                  className="hidden"
                />
                
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3.5 border border-blue-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  Drag & drop file here, or <span className="text-blue-600 font-bold hover:underline">browse files</span>
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF, DOCX, XLSX, TXT, JSON, MD (Max 25MB)
                </span>
              </div>
            ) : (
              // Selected file view
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleRemoveFile}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Upload progress indicator */}
          {uploading && (
            <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/20 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Indexing and parsing document tags...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-150 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload submit action button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={uploading || !file || !folder}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              Start Upload Process
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
  );
};

export default Upload;
