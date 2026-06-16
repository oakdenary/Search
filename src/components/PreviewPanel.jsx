import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PDFPreviewer from './PDFPreviewer';
import DocxPreviewer, { countInstances } from './DocxPreviewer';
import ExcelPreviewer from './ExcelPreviewer';

/**
 * Returns the total count of searchTerm instances in a mock document's text content.
 * This mirrors the same content generation in DocxPreviewer to keep counts in sync.
 */
const getDocTextContent = (title) => {
  const filename = title.toLowerCase();

  if (filename.includes('testa')) {
    return [
      'Testa Keyword Analysis Report',
      'Cross-Module Variable Reference & Validation Analysis',
      'This report documents the comprehensive analysis of the testa variable across the enterprise codebase. The testa identifier was first introduced in Q2 as a placeholder for integration testing. Since then, testa has propagated to 14 modules and 6 service endpoints. This review ensures every testa reference is cataloged and validated.',
      'The authentication service uses testa in 3 locations: the login handler, the token refresh middleware, and the session validator. The search indexer references testa in its query parser and result ranker. The upload pipeline invokes testa during file metadata extraction and content hashing.',
      'To validate each testa instance, we perform automated regression tests. Each testa occurrence is flagged and compared against the baseline schema. If a testa reference deviates from the expected pattern, it is marked for manual review. The testa validation suite runs nightly and reports are generated each morning.',
      'Leaving testa references in production code carries moderate risk. While testa itself is inert, downstream consumers may interpret testa values as live data. We recommend replacing testa with environment-specific identifiers before the Q3 release. Until then, testa should remain guarded behind feature flags.',
      'The team should schedule a testa cleanup sprint. All testa references should be migrated to the new naming convention. Automated linting rules should flag any new testa usage introduced after the cutoff date. A final testa audit will be conducted before launch.'
    ].join(' ');
  }

  if (filename.includes('vercel')) {
    return [
      'Vercel Design System Inspired Guide',
      'Enterprise Front-end Engineering Guidelines',
      'Ensure spacing is strictly aligned to a 4px/8px grid. Background colors should be slate-50/100, text should use Plus Jakarta Sans, and borders should be subtle (slate-200). Main body text should use a weight of 400 with 1.625 line height, and bold headings must be tracked slightly tighter (-0.02em).',
      'For overlays and modals, use the glass-panel utility: background color of rgba(255, 255, 255, 0.7) with a backdrop filter blur of 12px. The border should use a semi-transparent white border to create a polished reflective edge.',
      'Transitions must use a cubic-bezier(0.4, 0, 0.2, 1) timing function with a duration of 300ms for entries and 200ms for exits. Micro-interactions like scale-down on active press (active:scale-95) improve touch responsiveness.'
    ].join(' ');
  }

  if (filename.includes('safety') || filename.includes('hr')) {
    return [
      'Workplace Safety & Health Guidelines',
      'Internal Draft & Compliance Training Policies',
      'This is a draft version of the employee handbook. For internal testing and training purposes only. It outlines default emergency procedures and safety inspections. All onsite employees must follow the protocols described herein.',
      'All accidents, injuries, or hazardous conditions must be reported immediately using the online portal. Failure to log incidents within 24 hours of occurrence can result in compliance flags. Forms can be uploaded in the shared folder.',
      'Employees are encouraged to requests sit-stand desks and orthopedic office chairs. Remote employees can submit home office equipment reimbursement requests up to $500 per calendar year.'
    ].join(' ');
  }

  return '';
};

const PreviewPanel = ({ doc, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Instance finder state
  const [finderOpen, setFinderOpen] = useState(false);
  const [finderQuery, setFinderQuery] = useState('');
  const [activeInstanceIndex, setActiveInstanceIndex] = useState(0);

  // Keyboard navigation support: Close panel on pressing escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (finderOpen) {
          setFinderOpen(false);
          setFinderQuery('');
          setActiveInstanceIndex(0);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, finderOpen]);

  // Simulate loading skeleton transition when selected document changes
  useEffect(() => {
    if (!doc) return;
    setLoading(true);
    setError(false);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 550); // Natural visual feel
    
    return () => clearTimeout(timer);
  }, [doc.id]);

  // Reset finder when doc changes
  useEffect(() => {
    setFinderQuery('');
    setActiveInstanceIndex(0);
  }, [doc.id]);

  if (!doc) return null;

  const { title, folder, similarityScore, snippet } = doc;
  const ext = title.split('.').pop().toLowerCase();
  
  // Format simulated folder name & modified date
  const folderNameFormatted = folder.charAt(0).toUpperCase() + folder.slice(1);
  const lastModifiedSimulated = doc.id.includes('test') 
    ? 'Jun 10, 2026, 04:32 PM'
    : 'May 28, 2026, 11:15 AM';

  // Compute total instances for the finder
  const isTextPreviewable = ext === 'docx' || ext === 'doc';
  const docText = isTextPreviewable ? getDocTextContent(title) : '';
  const totalInstances = finderQuery.trim() ? countInstances(docText, finderQuery) : 0;

  const handleFinderNext = useCallback(() => {
    if (totalInstances === 0) return;
    setActiveInstanceIndex((prev) => (prev + 1) % totalInstances);
  }, [totalInstances]);

  const handleFinderPrev = useCallback(() => {
    if (totalInstances === 0) return;
    setActiveInstanceIndex((prev) => (prev - 1 + totalInstances) % totalInstances);
  }, [totalInstances]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveInstanceIndex(0);
  }, [finderQuery]);

  // Determine file type badge coloring
  const getFileTypeBadge = (extension) => {
    switch (extension) {
      case 'pdf':
        return { label: 'PDF Document', color: 'bg-red-50 text-red-700 border-red-100' };
      case 'docx':
      case 'doc':
        return { label: 'Word Document', color: 'bg-blue-50 text-blue-700 border-blue-100' };
      case 'xlsx':
      case 'xls':
      case 'csv':
        return { label: 'Spreadsheet', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'json':
        return { label: 'JSON Data', color: 'bg-purple-50 text-purple-700 border-purple-100' };
      case 'md':
        return { label: 'Markdown', color: 'bg-amber-50 text-amber-700 border-amber-100' };
      default:
        return { label: 'System File', color: 'bg-slate-50 text-slate-700 border-slate-100' };
    }
  };

  const typeBadge = getFileTypeBadge(ext);

  // Render format specific sub-component
  const renderPreviewContent = () => {
    if (ext === 'pdf') {
      return <PDFPreviewer url="/sample.pdf" />;
    } else if (ext === 'docx' || ext === 'doc') {
      return <DocxPreviewer title={title} snippet={snippet} searchTerm={finderQuery} activeInstanceIndex={activeInstanceIndex} />;
    } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <ExcelPreviewer title={title} snippet={snippet} />;
    } else {
      // Fallback preview not available state
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[350px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <div className="rounded-full bg-slate-100 p-3 text-slate-400 border border-slate-200/60 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-800">Preview not available</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
            No document renderer is set up for file extension <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-600">.{ext}</code>. Full search contents remain indexed.
          </p>

          <div className="mt-6 w-full text-left bg-white rounded-lg border border-slate-200/80 p-3.5 space-y-2.5 shadow-sm text-xs font-sans">
            <div className="font-bold text-slate-700 border-b border-slate-100 pb-1.5 uppercase tracking-wider text-[10px]">
              Document Metadata
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-medium">Filename</span>
              <span className="col-span-2 text-slate-700 font-semibold break-all">{title}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-medium">Folder</span>
              <span className="col-span-2 text-slate-700 font-semibold">{folderNameFormatted}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-medium">Relevance</span>
              <span className="col-span-2 text-slate-700 font-semibold">{(similarityScore * 100).toFixed(1)}% Match</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/40 overflow-hidden glass-panel">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/95 border-b border-slate-200/80 px-5 py-3.5 flex flex-col gap-2 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate tracking-tight select-all" title={title}>
              {title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeBadge.color}`}>
                {typeBadge.label}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Modified: {lastModifiedSimulated}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Find in document button (only for text-previewable types) */}
            {isTextPreviewable && docText && (
              <button
                onClick={() => {
                  setFinderOpen(!finderOpen);
                  if (finderOpen) {
                    setFinderQuery('');
                    setActiveInstanceIndex(0);
                  }
                }}
                className={`rounded-full p-1.5 transition active:scale-90 ${
                  finderOpen
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
                title="Find in document (Ctrl+F)"
                aria-label="Find in document"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition active:scale-90 shrink-0"
              title="Close Preview (ESC)"
              aria-label="Close Preview Panel"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Instance Finder Toolbar — Chrome/browser-style */}
        {finderOpen && (
          <div className="flex items-center gap-2 pt-1 animate-fade-in">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/10 transition">
              <svg className="h-3.5 w-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
              <input
                type="text"
                value={finderQuery}
                onChange={(e) => setFinderQuery(e.target.value)}
                placeholder="Find in document..."
                className="flex-1 bg-transparent border-0 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 py-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.shiftKey) handleFinderPrev();
                    else handleFinderNext();
                  }
                }}
              />
              {/* Instance count badge */}
              {finderQuery.trim() && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                  totalInstances > 0
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {totalInstances > 0
                    ? `${activeInstanceIndex + 1} of ${totalInstances}`
                    : 'No matches'
                  }
                </span>
              )}
            </div>

            {/* Prev/Next navigation buttons */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={handleFinderPrev}
                disabled={totalInstances === 0}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent transition"
                title="Previous instance (Shift+Enter)"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <button
                onClick={handleFinderNext}
                disabled={totalInstances === 0}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent transition"
                title="Next instance (Enter)"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {/* Close finder button */}
            <button
              onClick={() => {
                setFinderOpen(false);
                setFinderQuery('');
                setActiveInstanceIndex(0);
              }}
              className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-90 transition"
              title="Close finder"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          // Skeleton loader
          <div className="space-y-4 animate-pulse">
            {/* Header placeholder */}
            <div className="flex justify-between items-center py-2">
              <div className="h-6 w-32 bg-slate-100 rounded" />
              <div className="h-6 w-24 bg-slate-100 rounded" />
            </div>
            {/* Canvas/Document sheet placeholder */}
            <div className="h-[280px] bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-slate-400 font-semibold font-sans">Generating document rendering...</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded w-full" />
              <div className="h-3.5 bg-slate-100 rounded w-5/6" />
              <div className="h-3.5 bg-slate-100 rounded w-2/3" />
            </div>
          </div>
        ) : (
          renderPreviewContent()
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
