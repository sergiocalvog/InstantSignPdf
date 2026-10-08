import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  RotateCcw,
  Check,
  PenTool,
  Upload,
  Type,
  Trash2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SavedSignature } from '../types';
import { StorageService } from '../services/storage';
import { useI18n } from '../i18n/I18nContext';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSignature: (sig: SavedSignature) => void;
}

type TabType = 'draw' | 'upload' | 'type';

interface Point {
  x: number;
  y: number;
}

const CURSIVE_FONTS = [
  { name: 'Elegante', style: 'italic 46px "Brush Script MT", "Caveat", cursive' },
  { name: 'Clásica', style: 'italic bold 42px "Zapf Chancery", "Great Vibes", cursive' },
  { name: 'Moderna', style: 'italic 40px "Segoe Script", "Dancing Script", cursive' },
  { name: 'Formal', style: 'italic bold 38px "Georgia", serif' },
];

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSelectSignature,
}) => {
  const { t, language } = useI18n();

  const INK_COLORS = [
    { name: t.sigInkNotaryBlue, hex: '#003366' },
    { name: t.sigInkBlack, hex: '#000000' },
    { name: t.sigInkNavy, hex: '#1e40af' },
  ];

  const STROKE_WIDTHS = [
    { name: t.sigStrokeFine, val: 1.8 },
    { name: t.sigStrokeMedium, val: 2.8 },
    { name: t.sigStrokeThick, val: 4.2 },
  ];

  const defaultTypedName = language === 'zh' ? '张三' : language === 'en' ? 'John Doe' : 'Laura Gómez';

  const [activeTab, setActiveTab] = useState<TabType>('draw');
  const [selectedColor, setSelectedColor] = useState<string>('#003366');
  const [strokeWidth, setStrokeWidth] = useState<number>(2.8);
  const [sigName, setSigName] = useState<string>('');

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<Point | null>(null);
  const lastMidPointRef = useRef<Point | null>(null);
  const strokesHistoryRef = useRef<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // Upload state
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [alphaThreshold, setAlphaThreshold] = useState<number>(220);
  const [recolorInk, setRecolorInk] = useState<boolean>(true);
  const uploadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Type signature state
  const [typedText, setTypedText] = useState<string>(() => defaultTypedName);
  const [selectedFontIndex, setSelectedFontIndex] = useState<number>(0);
  const typeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Saved signatures library
  const [savedLibrary, setSavedLibrary] = useState<SavedSignature[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedLibrary(StorageService.getSignatures());
      setTypedText(defaultTypedName);
      // reset canvas on open
      setTimeout(() => {
        initDrawingCanvas();
      }, 50);
    }
  }, [isOpen, defaultTypedName]);

  const initDrawingCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#ffffff';
    ctx.clearRect(0, 0, rect.width, rect.height);
    strokesHistoryRef.current = [];
    setHasDrawn(false);
  };

  // ----------------------------------------------------
  // Drawing Canvas Functions with continuous quadraticCurveTo smoothing
  // ----------------------------------------------------
  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pt = getCanvasCoordinates(e);
    if (!pt) return;

    // Capture pointer on modern touch/pen devices
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    isDrawingRef.current = true;
    lastPointRef.current = pt;
    lastMidPointRef.current = pt;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history state for undo
    strokesHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (strokesHistoryRef.current.length > 25) {
      strokesHistoryRef.current.shift();
    }

    // Draw initial dot with rounded cap
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = selectedColor;
    ctx.fill();
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current || !lastMidPointRef.current) return;
    e.preventDefault();
    const currentPt = getCanvasCoordinates(e);
    if (!currentPt) return;

    // Avoid micro-jitter if the pointer hasn't moved at least 0.5px
    const dx = currentPt.x - lastPointRef.current.x;
    const dy = currentPt.y - lastPointRef.current.y;
    if (dx * dx + dy * dy < 0.25) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Calculate mid point between last control point and current point
    const midPoint: Point = {
      x: (lastPointRef.current.x + currentPt.x) / 2,
      y: (lastPointRef.current.y + currentPt.y) / 2,
    };

    // Draw seamless curve from the PREVIOUS mid point to the NEW mid point
    ctx.beginPath();
    ctx.moveTo(lastMidPointRef.current.x, lastMidPointRef.current.y);
    ctx.quadraticCurveTo(
      lastPointRef.current.x,
      lastPointRef.current.y,
      midPoint.x,
      midPoint.y
    );
    ctx.stroke();

    // Advance points: the next segment starts exactly where this one ended
    lastPointRef.current = currentPt;
    lastMidPointRef.current = midPoint;
    setHasDrawn(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    if (isDrawingRef.current && lastPointRef.current && lastMidPointRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = selectedColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Connect the final segment to the end point
          ctx.beginPath();
          ctx.moveTo(lastMidPointRef.current.x, lastMidPointRef.current.y);
          ctx.lineTo(lastPointRef.current.x, lastPointRef.current.y);
          ctx.stroke();
        }
      }
    }
    isDrawingRef.current = false;
    lastPointRef.current = null;
    lastMidPointRef.current = null;
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (strokesHistoryRef.current.length > 0) {
      const prev = strokesHistoryRef.current.pop();
      if (prev) {
        ctx.putImageData(prev, 0, 0);
        if (strokesHistoryRef.current.length === 0) {
          setHasDrawn(false);
        }
      }
    }
  };

  const handleClearDraw = () => {
    initDrawingCanvas();
  };

  // Trims empty transparent padding around ink pixels and returns cropped transparent PNG
  const cropTransparentInk = (sourceCanvas: HTMLCanvasElement): { dataUrl: string; width: number; height: number } => {
    const ctx = sourceCanvas.getContext('2d');
    if (!ctx) return { dataUrl: sourceCanvas.toDataURL('image/png'), width: sourceCanvas.width, height: sourceCanvas.height };

    const { width, height } = sourceCanvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let foundPixel = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];
        // If not transparent
        if (alpha > 20) {
          foundPixel = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!foundPixel) {
      // Default to center box if blank
      minX = 0;
      minY = 0;
      maxX = width;
      maxY = height;
    }

    const padding = 12;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropW = Math.min(width - cropX, maxX - minX + padding * 2);
    const cropH = Math.min(height - cropY, maxY - minY + padding * 2);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = Math.max(30, cropW);
    croppedCanvas.height = Math.max(20, cropH);
    const cropCtx = croppedCanvas.getContext('2d');
    if (cropCtx) {
      cropCtx.drawImage(
        sourceCanvas,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        cropW,
        cropH
      );
    }

    return {
      dataUrl: croppedCanvas.toDataURL('image/png'),
      width: croppedCanvas.width,
      height: croppedCanvas.height,
    };
  };

  // ----------------------------------------------------
  // Image Upload & White-Removal Filter
  // ----------------------------------------------------
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Process uploaded image with alpha threshold and optional recoloring
  const processUploadedImage = useCallback(() => {
    if (!uploadedImageSrc || !uploadCanvasRef.current) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = uploadCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Color target parsed
      const targetR = parseInt(selectedColor.slice(1, 3), 16);
      const targetG = parseInt(selectedColor.slice(3, 5), 16);
      const targetB = parseInt(selectedColor.slice(5, 7), 16);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        if (luminance >= alphaThreshold) {
          // Pure transparent
          data[i + 3] = 0;
        } else {
          // Smooth alpha falloff near the threshold boundary
          const fadeStart = alphaThreshold - 35;
          let calculatedAlpha = 255;
          if (luminance > fadeStart) {
            calculatedAlpha = Math.round(255 * (1 - (luminance - fadeStart) / 35));
          }
          data[i + 3] = Math.min(data[i + 3], calculatedAlpha);

          if (recolorInk) {
            data[i] = targetR;
            data[i + 1] = targetG;
            data[i + 2] = targetB;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
    img.src = uploadedImageSrc;
  }, [uploadedImageSrc, alphaThreshold, recolorInk, selectedColor]);

  useEffect(() => {
    if (activeTab === 'upload' && uploadedImageSrc) {
      processUploadedImage();
    }
  }, [activeTab, uploadedImageSrc, alphaThreshold, recolorInk, selectedColor, processUploadedImage]);

  // ----------------------------------------------------
  // Type signature rendering
  // ----------------------------------------------------
  const renderTypedSignature = useCallback(() => {
    const canvas = typeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 600;
    const h = 200;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = selectedColor;
    ctx.font = CURSIVE_FONTS[selectedFontIndex].style;

    ctx.fillText(typedText || 'Firma', w / 2, h / 2 - 10);

    // Decorative underline flourish
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 140, h / 2 + 35);
    ctx.quadraticCurveTo(w / 2, h / 2 + 50, w / 2 + 140, h / 2 + 30);
    ctx.stroke();
  }, [typedText, selectedFontIndex, selectedColor]);

  useEffect(() => {
    if (activeTab === 'type') {
      renderTypedSignature();
    }
  }, [activeTab, typedText, selectedFontIndex, selectedColor, renderTypedSignature]);

  // ----------------------------------------------------
  // Final Save & Export
  // ----------------------------------------------------
  const handleFinalizeSignature = (saveToLib: boolean) => {
    let result: { dataUrl: string; width: number; height: number } | null = null;

    if (activeTab === 'draw') {
      if (!canvasRef.current || !hasDrawn) return;
      result = cropTransparentInk(canvasRef.current);
    } else if (activeTab === 'upload') {
      if (!uploadCanvasRef.current || !uploadedImageSrc) return;
      result = cropTransparentInk(uploadCanvasRef.current);
    } else if (activeTab === 'type') {
      if (!typeCanvasRef.current) return;
      result = cropTransparentInk(typeCanvasRef.current);
    }

    if (!result) return;

    const dateLocale = language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : 'es-ES';
    const signatureObject: SavedSignature = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: sigName.trim() || `${t.signatureDefaultLabel} ${new Date().toLocaleDateString(dateLocale)}`,
      dataUrl: result.dataUrl,
      createdAt: Date.now(),
      width: result.width,
      height: result.height,
      aspectRatio: result.width / result.height,
    };

    if (saveToLib) {
      StorageService.saveSignature(signatureObject);
    }

    onSelectSignature(signatureObject);
    onClose();
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteSignature(id);
    setSavedLibrary(StorageService.getSignatures());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t.sigModalTitle}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.sigModalSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title={t.sigCancelBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 px-6 pt-2">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'draw'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-zinc-900 rounded-t-lg'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <PenTool className="w-4 h-4" />
            {t.sigTabDraw}
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-zinc-900 rounded-t-lg'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            {t.sigTabUpload}
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'type'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-zinc-900 rounded-t-lg'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Type className="w-4 h-4" />
            {t.sigTabType}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Controls Bar: Colors & Thickness */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mr-1">{t.sigInkColorLabel}:</span>
              {INK_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setSelectedColor(c.hex)}
                  className={`group relative flex items-center justify-center w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    selectedColor === c.hex
                      ? 'border-blue-600 scale-110 shadow-xs'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>

            {/* Stroke Width Selector (for draw tab) */}
            {activeTab === 'draw' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mr-1">{t.sigStrokeWidthLabel}:</span>
                {STROKE_WIDTHS.map((sw) => (
                  <button
                    key={sw.val}
                    onClick={() => setStrokeWidth(sw.val)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      strokeWidth === sw.val
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {sw.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB 1: DRAW FREEHAND */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white rounded-xl overflow-hidden shadow-inner touch-none">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  style={{ touchAction: 'none' }}
                  className="w-full h-56 cursor-crosshair block touch-none"
                />

                {/* Guideline line for signature baseline */}
                <div className="absolute inset-x-8 bottom-10 border-b border-zinc-200 pointer-events-none flex items-center justify-between text-[11px] text-zinc-400 select-none">
                  <span>{t.sigBaselinePrompt}</span>
                  <span className="text-[10px] text-zinc-300">✍️</span>
                </div>

                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-400 text-sm px-4 text-center">
                    <span>{t.sigDrawPlaceholder}</span>
                  </div>
                )}
              </div>

              {/* Action buttons under canvas */}
              <div className="flex justify-end items-center text-xs gap-2">
                <button
                  onClick={handleUndo}
                  disabled={!hasDrawn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t.sigUndoBtn}
                </button>
                <button
                  onClick={handleClearDraw}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.sigClearBtn}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD & WHITE REMOVAL */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedImageSrc ? (
                <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer transition-colors p-6 text-center">
                  <Upload className="w-10 h-10 text-zinc-400 mb-2" />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {t.sigUploadTitle}
                  </span>
                  <span className="text-xs text-zinc-400 mt-1 max-w-sm">
                    {t.sigUploadHelp}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-100 dark:bg-zinc-950 p-2 flex items-center justify-center min-h-[180px] overflow-hidden">
                    {/* Checkerboard background indicating transparency */}
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, #888 1px, transparent 1px)',
                        backgroundSize: '12px 12px',
                      }}
                    />
                    <canvas
                      ref={uploadCanvasRef}
                      className="max-h-52 max-w-full object-contain relative z-10"
                    />
                  </div>

                  {/* Filtering controls */}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-3 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-blue-500" />
                        {t.sigUploadThresholdLabel}: {alphaThreshold}
                      </span>
                      <button
                        onClick={() => setUploadedImageSrc(null)}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        {t.sigChangeImage}
                      </button>
                    </div>

                    <input
                      type="range"
                      min="150"
                      max="250"
                      value={alphaThreshold}
                      onChange={(e) => setAlphaThreshold(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="recolorCheck"
                        checked={recolorInk}
                        onChange={(e) => setRecolorInk(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="recolorCheck" className="text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                        {t.sigRecolorLabel} ({selectedColor})
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TYPE SIGNATURE */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  {t.sigTypePrompt}
                </label>
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder={defaultTypedName}
                  className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Style selector */}
              <div className="grid grid-cols-2 gap-2">
                {CURSIVE_FONTS.map((font, idx) => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFontIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedFontIndex === idx
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                      {font.name}
                    </span>
                    <span
                      className="text-lg block truncate"
                      style={{
                        fontFamily: font.name.includes('Clásica') ? 'cursive' : 'serif',
                        fontStyle: 'italic',
                        color: selectedColor,
                      }}
                    >
                      {typedText || t.signatureDefaultLabel}
                    </span>
                  </button>
                ))}
              </div>

              {/* Canvas Preview */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-2 flex items-center justify-center min-h-[110px]">
                <canvas ref={typeCanvasRef} className="max-h-28 max-w-full object-contain" />
              </div>
            </div>
          )}

          {/* Signature Name & Presets */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              {t.sigNameLabel}
            </label>
            <input
              type="text"
              value={sigName}
              onChange={(e) => setSigName(e.target.value)}
              placeholder={t.sigNamePlaceholder}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Library of previously saved signatures */}
          {savedLibrary.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-2">
                {t.sigSavedLibraryTitle}
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {savedLibrary.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectSignature(item);
                      onClose();
                    }}
                    className="group relative flex-shrink-0 w-36 h-20 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 rounded-xl p-2 cursor-pointer flex flex-col items-center justify-between transition-all hover:shadow-md"
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      className="max-h-12 max-w-full object-contain my-auto"
                    />
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate w-full text-center">
                      {item.name}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSaved(item.id, e)}
                      className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-zinc-900/80 hover:bg-red-500 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400"
                      title={t.canvasDelete}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            {t.sigCancelBtn}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => handleFinalizeSignature(false)}
              disabled={activeTab === 'draw' && !hasDrawn}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {t.sigUseOnceBtn}
            </button>
            <button
              onClick={() => handleFinalizeSignature(true)}
              disabled={activeTab === 'draw' && !hasDrawn}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {t.sigSaveAndUseBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
