import React, { useEffect, useState, useRef } from 'react';

const PDFPreviewer = ({ url = '/sample.pdf' }) => {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load PDF.js Script dynamically
  useEffect(() => {
    let active = true;

    const loadPdfjs = async () => {
      try {
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.async = true;
          document.body.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load PDF.js viewer library.'));
          });
        }

        if (active) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          loadDocument();
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Error loading PDF library');
          setLoading(false);
        }
      }
    };

    const loadDocument = async () => {
      try {
        const loadingTask = window.pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        if (active) {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          setPageNumber(1);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError('Could not load PDF document. Please verify the file path.');
          setLoading(false);
        }
      }
    };

    loadPdfjs();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [url]);

  // Render canvas when pageNumber, scale, or pdf changes
  useEffect(() => {
    if (!pdf) return;

    let active = true;

    const render = async () => {
      try {
        // Cancel existing render task if one is running
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdf.getPage(pageNumber);
        if (!active) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        
        // Match canvas resolution to device pixel ratio for super crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.scale(dpr, dpr);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('PDF page render error:', err);
        }
      }
    };

    render();

    return () => {
      active = false;
    };
  }, [pdf, pageNumber, scale]);

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(prev => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[400px]">
        <div className="flex space-x-2 animate-pulse">
          <div className="h-2 w-2 bg-blue-500 rounded-full" />
          <div className="h-2 w-2 bg-blue-500 rounded-full" />
          <div className="h-2 w-2 bg-blue-500 rounded-full" />
        </div>
        <span className="text-xs text-slate-400 font-medium font-sans">Parsing PDF structure...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[350px]">
        <div className="rounded-full bg-red-50 p-2.5 text-red-500 border border-red-100 mb-3">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-slate-800">Failed to render PDF</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200/60 overflow-hidden">
      {/* Top Floating Controls Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200/80 shrink-0 shadow-sm">
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Previous Page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-xs font-semibold text-slate-600 font-sans px-1">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= numPages}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Next Page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Zoom Out"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <span className="text-xs font-semibold text-slate-600 font-sans w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Zoom In"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Render Canvas Container */}
      <div className="flex-1 overflow-auto p-4 flex justify-center items-start min-h-[300px]">
        <div className="bg-white p-2 shadow-sm border border-slate-200/80 rounded">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewer;
