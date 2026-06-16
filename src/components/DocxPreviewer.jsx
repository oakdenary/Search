import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Renders text with highlights for matching search terms.
 * The active instance (by global index) gets a different color.
 */
const HighlightedText = ({ text, searchTerm, instanceOffset, activeIndex }) => {
  if (!searchTerm || !searchTerm.trim()) {
    return <>{text}</>;
  }

  const parts = [];
  const lower = text.toLowerCase();
  const termLower = searchTerm.toLowerCase();
  let cursor = 0;
  let localIdx = 0;

  while (cursor < text.length) {
    const matchPos = lower.indexOf(termLower, cursor);
    if (matchPos === -1) {
      parts.push(<span key={`t-${cursor}`}>{text.slice(cursor)}</span>);
      break;
    }
    if (matchPos > cursor) {
      parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, matchPos)}</span>);
    }
    const globalIdx = instanceOffset + localIdx;
    const isActive = globalIdx === activeIndex;
    parts.push(
      <mark
        key={`m-${matchPos}`}
        data-instance-index={globalIdx}
        className={`rounded px-0.5 transition-colors duration-200 ${
          isActive
            ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500/40'
            : 'bg-yellow-200/80 text-yellow-900'
        }`}
      >
        {text.slice(matchPos, matchPos + termLower.length)}
      </mark>
    );
    localIdx++;
    cursor = matchPos + termLower.length;
  }

  return <>{parts}</>;
};

/**
 * Counts the number of occurrences of searchTerm in a string.
 */
const countInstances = (text, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return 0;
  const lower = text.toLowerCase();
  const termLower = searchTerm.toLowerCase();
  let count = 0;
  let pos = 0;
  while ((pos = lower.indexOf(termLower, pos)) !== -1) {
    count++;
    pos += termLower.length;
  }
  return count;
};

const DocxPreviewer = ({ title = '', snippet = '', searchTerm = '', activeInstanceIndex = 0 }) => {
  const contentRef = useRef(null);

  const getMockDocContent = () => {
    const filename = title.toLowerCase();
    
    if (filename.includes('testa')) {
      return {
        title: 'Testa Keyword Analysis Report',
        subtitle: 'Cross-Module Variable Reference & Validation Analysis',
        author: 'Engineering QA Team',
        date: 'June 2026 — Internal Review',
        paragraphs: [
          {
            type: 'heading',
            text: '1. Executive Summary'
          },
          {
            type: 'body',
            text: 'This report documents the comprehensive analysis of the testa variable across the enterprise codebase. The testa identifier was first introduced in Q2 as a placeholder for integration testing. Since then, testa has propagated to 14 modules and 6 service endpoints. This review ensures every testa reference is cataloged and validated.'
          },
          {
            type: 'heading',
            text: '2. Module Distribution'
          },
          {
            type: 'body',
            text: 'The authentication service uses testa in 3 locations: the login handler, the token refresh middleware, and the session validator. The search indexer references testa in its query parser and result ranker. The upload pipeline invokes testa during file metadata extraction and content hashing.'
          },
          {
            type: 'heading',
            text: '3. Validation Methodology'
          },
          {
            type: 'body',
            text: 'To validate each testa instance, we perform automated regression tests. Each testa occurrence is flagged and compared against the baseline schema. If a testa reference deviates from the expected pattern, it is marked for manual review. The testa validation suite runs nightly and reports are generated each morning.'
          },
          {
            type: 'heading',
            text: '4. Risk Assessment'
          },
          {
            type: 'body',
            text: 'Leaving testa references in production code carries moderate risk. While testa itself is inert, downstream consumers may interpret testa values as live data. We recommend replacing testa with environment-specific identifiers before the Q3 release. Until then, testa should remain guarded behind feature flags.'
          },
          {
            type: 'heading',
            text: '5. Recommendations & Next Steps'
          },
          {
            type: 'body',
            text: 'The team should schedule a testa cleanup sprint. All testa references should be migrated to the new naming convention. Automated linting rules should flag any new testa usage introduced after the cutoff date. A final testa audit will be conducted before launch.'
          }
        ]
      };
    }

    if (filename.includes('vercel')) {
      return {
        title: 'Vercel Design System Inspired Guide',
        subtitle: 'Enterprise Front-end Engineering Guidelines',
        author: 'Design & UX Platform Team',
        date: 'Updated June 2026',
        paragraphs: [
          {
            type: 'heading',
            text: '1. Core Typographic Scale'
          },
          {
            type: 'body',
            text: 'Ensure spacing is strictly aligned to a 4px/8px grid. Background colors should be slate-50/100, text should use Plus Jakarta Sans, and borders should be subtle (slate-200). Main body text should use a weight of 400 with 1.625 line height, and bold headings must be tracked slightly tighter (-0.02em).'
          },
          {
            type: 'heading',
            text: '2. Glassmorphism & UI Panels'
          },
          {
            type: 'body',
            text: 'For overlays and modals, use the glass-panel utility: background color of rgba(255, 255, 255, 0.7) with a backdrop filter blur of 12px. The border should use a semi-transparent white border to create a polished reflective edge.'
          },
          {
            type: 'heading',
            text: '3. Animation Guidelines'
          },
          {
            type: 'body',
            text: 'Transitions must use a cubic-bezier(0.4, 0, 0.2, 1) timing function with a duration of 300ms for entries and 200ms for exits. Micro-interactions like scale-down on active press (active:scale-95) improve touch responsiveness.'
          }
        ]
      };
    }

    if (filename.includes('safety') || filename.includes('hr')) {
      return {
        title: 'Workplace Safety & Health Guidelines',
        subtitle: 'Internal Draft & Compliance Training Policies',
        author: 'HR Operations Group',
        date: 'Draft Version 3.4',
        paragraphs: [
          {
            type: 'heading',
            text: '1. Scope & Introduction'
          },
          {
            type: 'body',
            text: 'This is a draft version of the employee handbook. For internal testing and training purposes only. It outlines default emergency procedures and safety inspections. All onsite employees must follow the protocols described herein.'
          },
          {
            type: 'heading',
            text: '2. Incident Reporting Protocols'
          },
          {
            type: 'body',
            text: 'All accidents, injuries, or hazardous conditions must be reported immediately using the online portal. Failure to log incidents within 24 hours of occurrence can result in compliance flags. Forms can be uploaded in the shared folder.'
          },
          {
            type: 'heading',
            text: '3. Ergonomic Assessment'
          },
          {
            type: 'body',
            text: 'Employees are encouraged to requests sit-stand desks and orthopedic office chairs. Remote employees can submit home office equipment reimbursement requests up to $500 per calendar year.'
          }
        ]
      };
    }

    // Default Fallback content if it's a generic DOCX file
    return null;
  };

  const doc = getMockDocContent();

  // Scroll to active highlighted instance when activeInstanceIndex changes
  useEffect(() => {
    if (!contentRef.current || !searchTerm) return;
    const activeEl = contentRef.current.querySelector(`mark[data-instance-index="${activeInstanceIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeInstanceIndex, searchTerm]);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[350px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <div className="rounded-full bg-blue-50 p-2.5 text-blue-500 border border-blue-100 mb-3 animate-pulse">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-slate-800">Word Preview Placeholder</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
          Full word processor layout is restricted. The document snippet is shown below:
        </p>
        <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg text-left text-xs font-sans text-slate-600 max-w-sm line-clamp-4 leading-relaxed italic">
          "{snippet || 'No text snippet index available.'}"
        </div>
      </div>
    );
  }

  // Compute per-paragraph instance offsets for highlight tracking
  let runningOffset = 0;
  // Also count title and subtitle instances
  const titleCount = countInstances(doc.title, searchTerm);
  const subtitleCount = doc.subtitle ? countInstances(doc.subtitle, searchTerm) : 0;
  runningOffset += titleCount + subtitleCount;

  const paragraphOffsets = doc.paragraphs.map((para) => {
    const offset = runningOffset;
    runningOffset += countInstances(para.text, searchTerm);
    return offset;
  });

  return (
    <div ref={contentRef} className="flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200/60 p-4 overflow-auto">
      {/* Mock Word Document Sheet */}
      <div className="bg-white border border-slate-200/80 rounded-lg shadow-sm p-6 sm:p-8 font-serif text-slate-800 leading-relaxed max-w-2xl mx-auto min-h-[500px]">
        {/* Doc Header */}
        <div className="border-b border-slate-200 pb-5 mb-5 font-sans">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            <HighlightedText text={doc.title} searchTerm={searchTerm} instanceOffset={0} activeIndex={activeInstanceIndex} />
          </h1>
          {doc.subtitle && (
            <p className="text-sm text-slate-500 mt-1 font-medium italic">
              <HighlightedText text={doc.subtitle} searchTerm={searchTerm} instanceOffset={titleCount} activeIndex={activeInstanceIndex} />
            </p>
          )}
          
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>Author: <strong className="text-slate-600 font-semibold">{doc.author}</strong></span>
            <span>•</span>
            <span>Date: <strong className="text-slate-600 font-semibold">{doc.date}</strong></span>
          </div>
        </div>

        {/* Doc Content */}
        <div className="space-y-4 text-sm sm:text-base font-serif">
          {doc.paragraphs.map((para, idx) => {
            if (para.type === 'heading') {
              return (
                <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 font-sans pt-3 pb-1 border-b border-slate-100/60">
                  <HighlightedText text={para.text} searchTerm={searchTerm} instanceOffset={paragraphOffsets[idx]} activeIndex={activeInstanceIndex} />
                </h3>
              );
            }
            return (
              <p key={idx} className="indent-4 sm:indent-6 text-slate-700 leading-loose text-justify">
                <HighlightedText text={para.text} searchTerm={searchTerm} instanceOffset={paragraphOffsets[idx]} activeIndex={activeInstanceIndex} />
              </p>
            );
          })}
        </div>

        {/* Page Footer */}
        <div className="mt-12 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-sans">
          Document Confidential • Page 1 of 1
        </div>
      </div>
    </div>
  );
};

// Export the countInstances helper so PreviewPanel can compute total count
export { countInstances };
export default DocxPreviewer;
