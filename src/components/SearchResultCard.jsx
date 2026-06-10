import React, { useState } from 'react';

const SearchResultCard = ({ result }) => {
  const [downloading, setDownloading] = useState(false);
  
  const { title, folderName, similarityScore, snippet } = result;

  // Detect file extension and assign appropriate icon / colors
  const getFileStyle = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return {
          iconColor: 'text-red-500 bg-red-50 border-red-100',
          badge: 'PDF',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          )
        };
      case 'xlsx':
      case 'xls':
      case 'csv':
        return {
          iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          badge: 'Sheet',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
            </svg>
          )
        };
      case 'docx':
      case 'doc':
        return {
          iconColor: 'text-blue-500 bg-blue-50 border-blue-100',
          badge: 'Doc',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          )
        };
      case 'json':
      case 'js':
      case 'md':
        return {
          iconColor: 'text-purple-600 bg-purple-50 border-purple-100',
          badge: 'Code',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          )
        };
      default:
        return {
          iconColor: 'text-slate-500 bg-slate-50 border-slate-100',
          badge: 'File',
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          )
        };
    }
  };

  const fileStyle = getFileStyle(title);

  // Download simulation that generates a real file containing the mock search result details.
  const triggerDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      try {
        const element = document.createElement('a');
        const fileContent = `Deep Document Search - Enterprise Download\n======================================\n\nDocument Title: ${title}\nFolder: ${folderName}\nSimilarity Score: ${(similarityScore * 100).toFixed(1)}%\n\nIndexed Content Excerpt:\n-----------------------\n${snippet}\n\n======================================\n© Deep Document Search`;
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(blob);
        element.download = `${title.split('.')[0]}_search_snippet.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } catch (err) {
        console.error('Download failed', err);
      } finally {
        setDownloading(false);
      }
    }, 450);
  };

  // Determine similarity text/badge color based on score
  const getScoreBadgeColor = (score) => {
    const pct = score * 100;
    if (pct >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (pct >= 80) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  return (
    <div className="group relative rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5">
      <div className="flex items-start justify-between gap-4">
        {/* Title and Icon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${fileStyle.iconColor}`}>
            {fileStyle.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 uppercase tracking-wider">
                {folderName}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-[11px] font-semibold text-slate-400">{fileStyle.badge}</span>
            </div>
          </div>
        </div>

        {/* Similarity Score */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getScoreBadgeColor(similarityScore)}`}>
            {(similarityScore * 100).toFixed(1)}% Match
          </span>
          <span className="text-[10px] text-slate-400">similarity score</span>
        </div>
      </div>

      {/* Snippet box */}
      <div className="mt-4 rounded-lg bg-slate-50/60 border border-slate-100 p-3.5 text-sm leading-relaxed text-slate-600 select-all font-sans relative">
        <span className="absolute -top-2 left-3 bg-white px-1.5 text-[9px] font-bold text-slate-400 border border-slate-200/60 rounded uppercase tracking-wider">
          Matching Segment
        </span>
        {snippet}
      </div>

      {/* Download Action Footer */}
      <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
        <button
          onClick={triggerDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition active:scale-95 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Download File</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchResultCard;
