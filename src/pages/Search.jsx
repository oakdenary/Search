import React, { useState, useEffect } from 'react';
import { searchDocuments } from '../api/search';
import { getFolders } from '../api/folders';
import { getUserAccess } from '../api/users';
import { mockDb } from '../api/client';
import SearchResultCard from '../components/SearchResultCard';

const Search = () => {
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('');
  const [folders, setFolders] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  
  const currentUser = mockDb.getCurrentUser();

  // Load folder dropdown choices on mount (constrained by user access permissions)
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all folders
        const resFolders = await getFolders();
        const allFolders = Array.isArray(resFolders) ? resFolders : [];
        
        if (currentUser && currentUser.role !== 'admin') {
          // Normal user: fetch their specific folder access rights
          const allowedFolderIds = await getUserAccess(currentUser.id);
          const allowedFolderIdsArray = Array.isArray(allowedFolderIds) ? allowedFolderIds : [];
          const filteredFolders = allFolders.filter((f) => allowedFolderIdsArray.includes(f.id));
          setFolders(filteredFolders);
        } else {
          // Admins can see all folders
          setFolders(allFolders);
        }
      } catch (err) {
        setError('Failed to load search context folders.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const data = await searchDocuments(query, folder);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Search request failed. Please check backend connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setFolder('');
    setResults([]);
    setHasSearched(false);
    setError('');
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8 flex-1 flex flex-col justify-center">
      {/* Centering and sizing container for the search engine banner and form */}
      <div className={`w-full transition-all duration-700 ease-in-out flex flex-col justify-center ${
        hasSearched 
          ? 'mb-10 pt-2' 
          : 'my-auto py-24 sm:py-36'
      }`}>
        {/* Search Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl font-sans">
            Deep Document Search
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-sans">
            {currentUser ? (
              <>Welcome back, <span className="font-semibold text-slate-700">{currentUser.fullName}</span>. Query indexed enterprise documents.</>
            ) : (
              'Query indexed enterprise files across permitted storage folders.'
            )}
          </p>
        </div>

        {/* Capsule-shaped Search and Filter Container */}
        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="search-glow-container rounded-full bg-white border border-slate-200 p-1.5 flex flex-col sm:flex-row items-center gap-2">
            {/* Search query input */}
            <div className="flex-1 flex items-center gap-2.5 pl-4 w-full">
              <svg className="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search file names, matching sentences, reports..."
                className="w-full bg-transparent border-0 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 py-2"
              />
            </div>

            {/* Vertical divider on desktop */}
            <div className="hidden sm:block h-6 w-[1px] bg-slate-200 shrink-0" />

            {/* Folder Select Dropdown */}
            <div className="w-full sm:w-auto shrink-0 px-2 sm:px-0">
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full bg-transparent border-0 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-0 py-2 pl-2 pr-8 cursor-pointer hover:text-slate-900"
              >
                <option value="">All Permitted Folders</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons inside capsule */}
            <div className="flex w-full sm:w-auto gap-1 px-1 justify-end shrink-0">
              {(query || folder) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full px-3.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition active:scale-[0.98] shrink-0"
              >
                Search
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-3 text-center text-xs text-red-500 font-semibold">{error}</div>
          )}
        </div>
      </div>

      {/* Search Results Area */}
      {hasSearched && (
        <div className="flex-1 max-w-4xl mx-auto w-full transition-opacity duration-300">
          {loading ? (
            // Dynamic Loading Skeleton Cards
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-xl border border-slate-200/60 bg-white p-5 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 items-center w-2/3">
                      <div className="h-10 w-10 bg-slate-100 rounded-lg shrink-0" />
                      <div className="space-y-2 w-full">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full w-20" />
                  </div>
                  <div className="mt-4 h-16 bg-slate-50 rounded-lg" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            // Render results cards list
            <div className="space-y-4 pb-12">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium px-1">
                <span>Showing {results.length} document matches</span>
                <span>Sorted by OpenSearch relevance</span>
              </div>
              {results.map((res) => (
                <SearchResultCard key={res.id} result={res} />
              ))}
            </div>
          ) : (
            // Styled Empty States
            <div className="text-center py-16 border border-dashed border-slate-200 bg-white rounded-2xl p-8 max-w-md mx-auto shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No Documents Found</h3>
              <p className="mt-1 text-xs text-slate-500 leading-normal max-w-xs mx-auto">
                We couldn't find matches for <span className="font-semibold text-slate-700">"{query || 'empty search'}"</span> in the selected folders. Try clearing filters or using general search keywords.
              </p>
              <button
                onClick={handleClear}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                Reset Search Parameters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
