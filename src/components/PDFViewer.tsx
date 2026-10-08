import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Vite URL worker import for offline zero-knowledge bundling
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Layers,
  Compass,
} from 'lucide-react';
import { Placement, PDFPageDimensions } from '../types';
import { OverlayCanvas } from './OverlayCanvas';
import { useI18n } from '../i18n/I18nContext';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PDFViewerProps {
  pdfBuffer: ArrayBuffer;
  placements: Placement[];
  onUpdatePlacement: (placement: Placement) => void;
  onUpdateMultiplePlacements?: (placements: Placement[]) => void;
  onDeletePlacement: (id: string) => void;
  onDuplicatePlacement: (placement: Placement) => void;
  selectedPlacementId: string | null;
  onSelectPlacement: (id: string | null) => void;
  onCanvasClickToPlace?: (pageNumber: number, x: number, y: number) => void;
  activeTool?: string | null;
  onPageDimensionsChange?: (dimensions: PDFPageDimensions) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfBuffer,
  placements,
  onUpdatePlacement,
  onUpdateMultiplePlacements,
  onDeletePlacement,
  onDuplicatePlacement,
  selectedPlacementId,
  onSelectPlacement,
  onCanvasClickToPlace,
  activeTool,
  onPageDimensionsChange,
}) => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // Mobile screen width typically 360-430px: fit A4 width (595pt)
      return Math.max(0.48, Math.min(0.85, Number(((window.innerWidth - 20) / 595.28).toFixed(2))));
    }
    return 1.15;
  });
  const [rotation, setRotation] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<PDFPageDimensions | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Notify parent of updated dimensions safely after render commit
  useEffect(() => {
    if (pageDimensions && onPageDimensionsChange) {
      onPageDimensionsChange(pageDimensions);
    }
  }, [pageDimensions, onPageDimensionsChange]);

  // Load PDF Document when buffer changes
  useEffect(() => {
    let isCancelled = false;
    setLoadError(null);

    const loadDocument = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: pdfBuffer.slice(0),
          cMapUrl: './cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);

          // On mobile, automatically set scale to fit the screen
          if (window.innerWidth < 768) {
            const firstPage = await doc.getPage(1);
            const vp = firstPage.getViewport({ scale: 1.0 });
            const fit = Number(((window.innerWidth - 20) / vp.width).toFixed(2));
            setZoomScale(Math.max(0.45, Math.min(0.9, fit)));
          }
        }
      } catch (err: any) {
        console.error('Error cargando PDF en pdfjs:', err);
        if (!isCancelled) {
          setLoadError(err?.message || 'Error al procesar el archivo PDF');
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [pdfBuffer]);

  // Render current page onto canvas
  const renderPage = useCallback(async () => {
    if (!pdfDoc) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      setIsRendering(true);
      const page = await pdfDoc.getPage(currentPage);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Base viewport at scale 1.0 to get native PDF dimensions (in 72 DPI points)
      const unscaledViewport = page.getViewport({ scale: 1.0, rotation });
      const originalWidth = unscaledViewport.width;
      const originalHeight = unscaledViewport.height;

      // Scaled viewport for current screen zoom
      const viewport = page.getViewport({ scale: zoomScale, rotation });

      // Handle High-DPI screens for crisp sharp text rendering
      const dpr = window.devicePixelRatio || 1;
      const renderedWidth = Math.round(viewport.width);
      const renderedHeight = Math.round(viewport.height);

      canvas.width = Math.round(renderedWidth * dpr);
      canvas.height = Math.round(renderedHeight * dpr);
      canvas.style.width = `${renderedWidth}px`;
      canvas.style.height = `${renderedHeight}px`;

      ctx.save();
      ctx.scale(dpr, dpr);

      const renderContext = {
        canvasContext: ctx,
        viewport,
        canvas,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;

      await task.promise;
      ctx.restore();

      const newDim: PDFPageDimensions = {
        pageNumber: currentPage,
        originalWidth,
        originalHeight,
        renderedWidth,
        renderedHeight,
        scale: zoomScale,
        rotation,
      };

      setPageDimensions(newDim);
      setIsRendering(false);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error al renderizar página del PDF:', err);
      }
      setIsRendering(false);
    }
  }, [pdfDoc, currentPage, zoomScale, rotation]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Page navigation
  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((p) => p + 1);
      onSelectPlacement(null);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      onSelectPlacement(null);
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomScale((z) => Math.min(3.0, Number((z + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomScale((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
  };

  const handleFitWidth = () => {
    if (!containerRef.current || !pageDimensions) return;
    const containerWidth = containerRef.current.clientWidth - 48; // padding
    const ratio = containerWidth / pageDimensions.originalWidth;
    setZoomScale(Math.max(0.6, Math.min(2.5, Number(ratio.toFixed(2)))));
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  // Directional scroll / pan for navigating document in all directions
  const handleScrollBy = (dx: number, dy: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
  };

  // Placements on the active page
  const activePagePlacements = placements.filter((p) => p.pageNumber === currentPage);

  return (
    <div className="flex flex-col h-full w-full select-none bg-zinc-200/70 dark:bg-zinc-950 overflow-hidden">
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md z-20 text-xs">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={t.viewerPrevPage}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {t.pageIndicator} <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentPage}</span> / {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={t.viewerNextPage}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom and view controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
            title={t.zoomOutTooltip}
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-md font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            title={t.fitPageTooltip}
          >
            {Math.round(zoomScale * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
            title={t.zoomInTooltip}
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          <button
            onClick={handleFitWidth}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
            title={t.viewerFitWidth}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRotate}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
            title={t.viewerRotate}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-2 sm:p-6 relative pb-28 md:pb-8 custom-scrollbars"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y',
        }}
      >
        <div className="min-w-fit min-h-fit m-auto flex justify-center items-start">
          {loadError ? (
            <div className="my-auto text-center p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-900 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto mb-3">
                ✕
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">
                {t.viewerRenderError}
              </h4>
              <p className="text-xs text-zinc-500 mb-4">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                {t.viewerReloadBtn}
              </button>
            </div>
          ) : (
            /* Page Container wrapper with exact dimensions */
            <div className="relative shadow-2xl rounded-sm transition-all duration-150 bg-white">
              {/* Underlying PDF Canvas */}
              <canvas ref={canvasRef} className="block pointer-events-none" />

              {/* Interactive Overlay Canvas placed over current page */}
              {pageDimensions && (
                <OverlayCanvas
                  pageNumber={currentPage}
                  scale={zoomScale}
                  pageWidth={pageDimensions.originalWidth}
                  pageHeight={pageDimensions.originalHeight}
                  renderedWidth={pageDimensions.renderedWidth}
                  renderedHeight={pageDimensions.renderedHeight}
                  placements={activePagePlacements}
                  onUpdatePlacement={onUpdatePlacement}
                  onUpdateMultiplePlacements={onUpdateMultiplePlacements}
                  onDeletePlacement={onDeletePlacement}
                  onDuplicatePlacement={onDuplicatePlacement}
                  selectedId={selectedPlacementId}
                  onSelectPlacement={onSelectPlacement}
                  onCanvasClickToPlace={(x, y) => {
                    const ptX = Math.round(x / zoomScale);
                    const ptY = Math.round(y / zoomScale);
                    onCanvasClickToPlace?.(currentPage, ptX, ptY);
                  }}
                  activeTool={activeTool}
                />
              )}

              {/* Loading indicator */}
              {isRendering && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-zinc-900/80 text-white rounded text-[11px] shadow-sm animate-pulse pointer-events-none">
                  {t.viewerRendering}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating directional navigation pad for moving Up, Down, Left, Right when zoomed */}
      <div className="fixed right-3 bottom-24 md:bottom-8 z-30 flex flex-col items-center bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1 backdrop-blur-md">
        <button
          onClick={() => handleScrollBy(0, -180)}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg cursor-pointer transition-colors active:scale-90"
          title={t.viewerMoveUp}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handleScrollBy(-180, 0)}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg cursor-pointer transition-colors active:scale-90"
            title={t.viewerMoveLeft}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitWidth}
            className="px-1.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md cursor-pointer transition-colors"
            title={t.viewerFitWidth}
          >
            {t.viewerFitBtn}
          </button>
          <button
            onClick={() => handleScrollBy(180, 0)}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg cursor-pointer transition-colors active:scale-90"
            title={t.viewerMoveRight}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => handleScrollBy(0, 180)}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg cursor-pointer transition-colors active:scale-90"
          title={t.viewerMoveDown}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
