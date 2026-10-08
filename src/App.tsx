/**
 * InstantSign PDF - Visor y Estampador de Firmas 100% Client-Side & Zero-Knowledge
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Calendar,
  Type,
  CheckSquare,
  XSquare,
  Download,
  ShieldCheck,
  Moon,
  Sun,
  FileText,
  Trash2,
  Settings,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Plus,
  Loader2,
  ArrowLeft,
  Stamp,
  IdCard,
  Coffee,
  Heart,
} from 'lucide-react';
import {
  Placement,
  SavedSignature,
  UserDataPresets,
  PDFPageDimensions,
  ToolType,
} from './types';
import { StorageService } from './services/storage';
import { exportSignedPDF, downloadPDF } from './services/pdfExporter';
import { generateSampleContractPDF } from './services/samplePdf';
import { PDFDropzone } from './components/PDFDropzone';
import { PDFViewer } from './components/PDFViewer';
import { SignaturePadModal } from './components/SignaturePadModal';
import { UserDataPresetsModal } from './components/UserDataPresetsModal';
import { DonationModal } from './components/DonationModal';
import { LanguageSelector } from './components/LanguageSelector';
import { useI18n } from './i18n/I18nContext';

export default function App() {
  const { t, language } = useI18n();

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => StorageService.getTheme());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    StorageService.saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // PDF Document State
  const [pdfData, setPdfData] = useState<{
    buffer: ArrayBuffer;
    fileName: string;
    fileSize: number;
  } | null>(null);

  // Mobile drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Placements state
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [dimensionsMap, setDimensionsMap] = useState<Record<number, PDFPageDimensions>>({});

  // Active tool state
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  // Modals state
  const [isSigModalOpen, setIsSigModalOpen] = useState<boolean>(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [isSignatureDropdownOpen, setIsSignatureDropdownOpen] = useState<boolean>(false);

  // Saved signatures & presets cache
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);
  const [userPresets, setUserPresets] = useState<UserDataPresets>(() => StorageService.getPresets());

  // Export progress state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);
  const [lastDownloadUrl, setLastDownloadUrl] = useState<string | null>(null);
  const [lastFileName, setLastFileName] = useState<string | null>(null);

  // Refresh signatures list
  const refreshSignatures = useCallback(() => {
    setSavedSignatures(StorageService.getSignatures());
  }, []);

  useEffect(() => {
    refreshSignatures();
  }, [refreshSignatures]);

  // Handle PDF loaded
  const handlePDFLoaded = (data: { buffer: ArrayBuffer; fileName: string; fileSize: number }) => {
    setPdfData(data);
    setPlacements([]);
    setSelectedPlacementId(null);
  };

  // Direct 1-click sample document loader
  const handleLoadSampleDoc = async () => {
    try {
      const buffer = await generateSampleContractPDF(language);
      const fileName =
        language === 'en'
          ? 'Services_Agreement_Demo.pdf'
          : language === 'zh'
          ? '技术服务与保密协议_演示样本.pdf'
          : 'Contrato_Servicios_Confidencialidad_Demo.pdf';
      handlePDFLoaded({
        buffer,
        fileName,
        fileSize: buffer.byteLength,
      });
    } catch (e) {
      console.error('Error generating sample PDF:', e);
    }
  };

  // Safe handler for PDF dimensions update
  const handlePageDimensionsChange = useCallback((dim: PDFPageDimensions) => {
    setDimensionsMap((prev) => {
      const existing = prev[dim.pageNumber];
      if (
        existing &&
        existing.renderedWidth === dim.renderedWidth &&
        existing.renderedHeight === dim.renderedHeight &&
        existing.scale === dim.scale &&
        existing.rotation === dim.rotation
      ) {
        return prev;
      }
      return {
        ...prev,
        [dim.pageNumber]: dim,
      };
    });
  }, []);

  // Update single placement
  const handleUpdatePlacement = (updated: Placement) => {
    setPlacements((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Update multiple placements (e.g. when moving an entire box/group)
  const handleUpdateMultiplePlacements = useCallback((updatedList: Placement[]) => {
    const updatedMap = new Map(updatedList.map((p) => [p.id, p]));
    setPlacements((prev) => prev.map((p) => updatedMap.get(p.id) || p));
  }, []);

  // Delete placement
  const handleDeletePlacement = (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlacementId === id) {
      setSelectedPlacementId(null);
    }
  };

  // Duplicate placement
  const handleDuplicatePlacement = (source: Placement) => {
    const duplicated: Placement = {
      ...source,
      id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: source.x + 15,
      y: source.y + 15,
    };
    setPlacements((prev) => [...prev, duplicated]);
    setSelectedPlacementId(duplicated.id);
  };

  // Format today's date based on language and preferences
  const getFormattedDate = (format: UserDataPresets['dateFormat'] = userPresets.dateFormat): string => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();

    if (format === 'DD-MM-YYYY') return `${d}-${m}-${y}`;
    if (format === 'YYYY-MM-DD') return `${y}-${m}-${d}`;
    if (format === 'LONG_ES') {
      const locale = language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : 'es-ES';
      return now.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return `${d}/${m}/${y}`;
  };

  // Add Placement helper
  const addPlacement = (
    type: Placement['type'],
    content?: string,
    width = 160,
    height = 50,
    options?: Partial<Placement>,
    targetPage = 1,
    posX?: number,
    posY?: number
  ) => {
    const currentDim = dimensionsMap[targetPage];
    const pageW = currentDim ? currentDim.originalWidth : 595.28;
    const pageH = currentDim ? currentDim.originalHeight : 841.89;
    const defaultX = posX !== undefined ? posX : Math.round(pageW * 0.48);
    const defaultY = posY !== undefined ? posY : Math.round(pageH * 0.72);

    const newPlacement: Placement = {
      id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      pageNumber: targetPage,
      x: Math.max(10, defaultX),
      y: Math.max(10, defaultY),
      width,
      height,
      content,
      color: options?.color || '#003366',
      fontSize: options?.fontSize || 13,
      fontFamily: options?.fontFamily || 'Helvetica',
      isBold: options?.isBold ?? false,
      label: options?.label,
    };

    setPlacements((prev) => [...prev, newPlacement]);
    setSelectedPlacementId(newPlacement.id);
    setActiveTool(null);
  };

  // Tool actions
  const handleSelectSignature = (sig: SavedSignature) => {
    // Proportional dimensions for the signature
    const defaultWidth = 170;
    const defaultHeight = Math.round(defaultWidth / (sig.aspectRatio || 2.2));

    addPlacement('signature', sig.dataUrl, defaultWidth, defaultHeight, {
      label: sig.name || t.signatureDefaultLabel,
      color: '#003366',
    });
    setIsSignatureDropdownOpen(false);
  };

  const handleStampDate = () => {
    const dateStr = getFormattedDate();
    addPlacement('date', dateStr, 110, 26, {
      fontSize: 13,
      label: t.dateDefaultLabel,
      color: '#003366',
    });
  };

  const handleStampText = () => {
    addPlacement('text', t.sampleTextDefault, 160, 28, {
      fontSize: 14,
      label: t.freeText,
      color: '#003366',
    });
  };

  const handleStampDNI = () => {
    const prefix = language === 'en' ? 'ID' : language === 'zh' ? '证件' : 'DNI';
    const text = userPresets.idNumber ? `${prefix}: ${userPresets.idNumber}` : `${prefix}: 00000000X`;
    addPlacement('text', text, 140, 26, {
      fontSize: 13,
      isBold: true,
      label: t.dniDefaultLabel,
      color: '#003366',
    });
  };

  const handleStampFullName = () => {
    const prefix = language === 'en' ? 'Signed' : language === 'zh' ? '签署' : 'Fdo.';
    const text = userPresets.fullName ? `${prefix}: ${userPresets.fullName}` : `${prefix}: ${t.presetsFullNamePlaceholder}`;
    addPlacement('text', text, 200, 28, {
      fontSize: 13,
      isBold: true,
      label: t.signerDefaultLabel,
      color: '#003366',
    });
  };

  const handleStampCheck = () => {
    addPlacement('check', '✔', 26, 26, {
      color: '#16a34a',
      label: t.tickLabel,
    });
  };

  const handleStampCross = () => {
    addPlacement('cross', '✘', 26, 26, {
      color: '#dc2626',
      label: t.crossLabel,
    });
  };

  // Combined signature block: Signature + Name + DNI + Date
  const handleStampCombinedBlock = () => {
    const sigs = savedSignatures;
    const defaultSig = sigs.length > 0 ? sigs[0] : null;

    if (!defaultSig) {
      setIsSigModalOpen(true);
      return;
    }

    const currentDim = dimensionsMap[1];
    const pageW = currentDim ? currentDim.originalWidth : 595.28;
    const pageH = currentDim ? currentDim.originalHeight : 841.89;
    const baseX = Math.round(pageW * 0.54);
    const baseY = Math.round(pageH * 0.69);

    const sigW = 140;
    const sigH = Math.round(sigW / (defaultSig.aspectRatio || 2.2));

    const groupId = `group_${Date.now()}`;
    const groupName = t.combinedBlockGroupName;

    // 1. Signature
    const p1: Placement = {
      id: `elem_${Date.now()}_1`,
      type: 'signature',
      pageNumber: 1,
      x: baseX,
      y: baseY,
      width: sigW,
      height: sigH,
      content: defaultSig.dataUrl,
      label: t.signatureDefaultLabel,
      color: '#003366',
      groupId,
      groupName,
    };

    // 2. Name
    const prefix = language === 'en' ? 'Signed' : language === 'zh' ? '签署人' : 'Fdo.';
    const nameText = userPresets.fullName ? `${prefix}: ${userPresets.fullName}` : `${prefix}: ${t.nameLabel}`;
    const p2: Placement = {
      id: `elem_${Date.now()}_2`,
      type: 'text',
      pageNumber: 1,
      x: baseX,
      y: baseY + sigH + 5,
      width: 175,
      height: 22,
      content: nameText,
      fontSize: 11,
      isBold: true,
      color: '#003366',
      label: t.nameLabel,
      groupId,
      groupName,
    };

    // 3. DNI & Date
    const idPrefix = language === 'en' ? 'ID' : language === 'zh' ? '证件' : 'NIF';
    const subText = `${userPresets.idNumber ? `${idPrefix}: ${userPresets.idNumber}` : idPrefix} | ${getFormattedDate()}`;
    const p3: Placement = {
      id: `elem_${Date.now()}_3`,
      type: 'text',
      pageNumber: 1,
      x: baseX,
      y: baseY + sigH + 28,
      width: 175,
      height: 20,
      content: subText,
      fontSize: 10,
      color: '#374151',
      label: t.dniAndDateLabel,
      groupId,
      groupName,
    };

    setPlacements((prev) => [...prev, p1, p2, p3]);
    setSelectedPlacementId(p1.id);
  };

  // Canvas click-to-place
  const handleCanvasClickToPlace = (pageNumber: number, x: number, y: number) => {
    if (!activeTool) return;

    if (activeTool === 'date') {
      addPlacement('date', getFormattedDate(), 110, 26, { fontSize: 13 }, pageNumber, x, y);
    } else if (activeTool === 'text') {
      addPlacement('text', 'Nuevo texto', 140, 26, { fontSize: 14 }, pageNumber, x, y);
    } else if (activeTool === 'dni') {
      addPlacement('text', userPresets.idNumber ? `DNI: ${userPresets.idNumber}` : 'DNI: ', 130, 24, { fontSize: 12 }, pageNumber, x, y);
    } else if (activeTool === 'check') {
      addPlacement('check', '✔', 24, 24, { color: '#16a34a' }, pageNumber, x - 12, y - 12);
    } else if (activeTool === 'cross') {
      addPlacement('cross', '✘', 24, 24, { color: '#dc2626' }, pageNumber, x - 12, y - 12);
    }
  };

  // Export signed PDF
  const handleExportPDF = async () => {
    if (!pdfData) return;

    try {
      setIsExporting(true);
      setExportSuccessMessage(null);
      setExportErrorMessage(null);

      const signedBytes = await exportSignedPDF(
        pdfData.buffer,
        placements,
        dimensionsMap
      );

      const baseName = pdfData.fileName.replace(/\.[^/.]+$/, '');
      const outFileName = `${baseName}_firmado.pdf`;

      const generatedUrl = downloadPDF(signedBytes, outFileName);
      setLastDownloadUrl(generatedUrl);
      setLastFileName(outFileName);

      setExportSuccessMessage(t.exportSuccessMsg);
      setTimeout(() => setExportSuccessMessage(null), 8000);

      // Open donation modal after download with a short delay for smooth UX
      setTimeout(() => {
        setIsDonationModalOpen(true);
      }, 700);
    } catch (err: any) {
      console.error('Error al exportar PDF:', err);
      setExportErrorMessage(
        err?.message
          ? `${t.exportErrorMsg} (${err.message})`
          : t.exportErrorMsg
      );
      setTimeout(() => setExportErrorMessage(null), 8000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* ----------------- TOP NAVBAR ----------------- */}
      <header className="h-16 px-4 md:px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 z-30 shadow-xs">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Stamp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                InstantSign <span className="text-blue-600 dark:text-blue-400">PDF</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                {t.brandSubtitle}
              </span>
            </div>
            {pdfData && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                {pdfData.fileName}
              </p>
            )}
          </div>
        </div>

        {/* Permanent Privacy Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t.privacyBadge}</span>
        </div>

        {/* Action Controls: Language, Presets, Theme & Download */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Language Selector Dropdown */}
          <LanguageSelector />

          {pdfData && (
            <button
              onClick={() => setPdfData(null)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              title={t.changePdfBtn}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t.changePdfBtn}
            </button>
          )}

          <button
            onClick={() => setIsPresetsModalOpen(true)}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title={t.presetsBtnTooltip}
          >
            <IdCard className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title={theme === 'dark' ? t.themeLightTooltip : t.themeDarkTooltip}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Download Signed PDF Primary Button */}
          {pdfData && (
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">{t.processingBtn}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t.downloadBtn}</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* ----------------- SUCCESS / ERROR NOTIFICATIONS ----------------- */}
      {exportSuccessMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between shadow-md z-40 animate-in slide-in-from-top duration-200">
          <div className="flex flex-wrap items-center gap-2 mx-auto">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{exportSuccessMessage}</span>
            {lastDownloadUrl && lastFileName && (
              <a
                href={lastDownloadUrl}
                download={lastFileName}
                className="underline font-bold text-white bg-emerald-700/60 hover:bg-emerald-700 px-2 py-0.5 rounded ml-1 transition-colors inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                {t.downloadAgainBtn}
              </a>
            )}
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-100 hover:text-white p-1 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {exportErrorMessage && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between shadow-md z-40 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 mx-auto">
            <span>⚠️ {exportErrorMessage}</span>
          </div>
          <button
            onClick={() => setExportErrorMessage(null)}
            className="text-rose-100 hover:text-white p-1 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* ----------------- MAIN WORKSPACE AREA ----------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Case 1: No PDF loaded -> Show Dropzone */}
        {!pdfData ? (
          <main className="flex-1 overflow-y-auto px-4 pt-3 sm:pt-5 pb-6 flex flex-col items-center">
            <div className="w-full max-w-2xl flex flex-col items-center">
              <div className="text-center mb-4 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-900 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.dropzonePrivacyTag}
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1.5">
                  {t.dropzoneTitle}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  {t.dropzoneSubtitle}
                </p>
              </div>

              <PDFDropzone onPDFLoaded={handlePDFLoaded} />
            </div>
          </main>
        ) : (
          /* Case 2: PDF loaded -> Fixed Left Toolbar (Desktop) + Full-screen PDF Viewer (Mobile & Desktop) */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full h-full">
            {/* FIXED LEFT SIDEBAR TOOLBAR (DESKTOP ONLY) */}
            <aside className="hidden md:flex md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 flex-col justify-between shrink-0 overflow-y-auto z-20 shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                  {t.toolsHeading}
                </div>

                {/* SIGNATURE TOOL WITH DROPDOWN */}
                <div className="relative">
                  <div className="flex rounded-xl shadow-xs overflow-hidden border border-blue-600 dark:border-blue-500">
                    <button
                      onClick={() => {
                        if (savedSignatures.length > 0) {
                          handleSelectSignature(savedSignatures[0]);
                        } else {
                          setIsSigModalOpen(true);
                        }
                      }}
                      className="flex-1 flex items-center gap-2.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>{t.addSignature}</span>
                    </button>
                    <button
                      onClick={() => setIsSignatureDropdownOpen((v) => !v)}
                      className="px-2 bg-blue-700 hover:bg-blue-800 text-white border-l border-blue-500 cursor-pointer"
                      title={t.signatureDropdownTooltip}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Signatures dropdown menu */}
                  {isSignatureDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-100">
                      <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-2 py-1">
                        {t.savedSignaturesTitle}
                      </div>
                      {savedSignatures.map((sig) => (
                        <div
                          key={sig.id}
                          onClick={() => handleSelectSignature(sig)}
                          className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700/70 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={sig.dataUrl}
                              alt={sig.name}
                              className="h-6 w-12 object-contain bg-zinc-50 dark:bg-zinc-900 rounded-xs border border-zinc-200 dark:border-zinc-700"
                            />
                            <span className="text-xs font-medium truncate text-zinc-800 dark:text-zinc-200">
                              {sig.name}
                            </span>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          setIsSignatureDropdownOpen(false);
                          setIsSigModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 px-2 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t.createScanNewSignature}
                      </button>
                    </div>
                  )}
                </div>

                {/* DATE STAMP BUTTON */}
                <button
                  onClick={handleStampDate}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="text-left flex-1">
                    <div>{t.stampDate}</div>
                    <div className="text-[10px] text-zinc-400 font-normal font-mono">
                      {getFormattedDate()}
                    </div>
                  </div>
                </button>

                {/* FREE TEXT BUTTON */}
                <button
                  onClick={handleStampText}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <Type className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  <div className="text-left flex-1">
                    <div>{t.freeText}</div>
                    <div className="text-[10px] text-zinc-400 font-normal">
                      {t.freeTextSubtitle}
                    </div>
                  </div>
                </button>

                {/* USER PRESETS: DNI & FULL NAME QUICK STAMPS */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                    <span>{t.quickIdHeading}</span>
                    <button
                      onClick={() => setIsPresetsModalOpen(true)}
                      className="text-blue-500 hover:underline text-[10px] font-normal cursor-pointer"
                    >
                      {t.editPresetsBtn}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleStampFullName}
                      className="p-2 bg-zinc-50 dark:bg-zinc-800/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-left truncate cursor-pointer"
                      title={userPresets.fullName}
                    >
                      <span className="text-[10px] text-zinc-400 block">{t.nameLabel}</span>
                      <span className="truncate block font-semibold text-zinc-800 dark:text-zinc-200">
                        {userPresets.fullName || t.addPresetPrompt}
                      </span>
                    </button>

                    <button
                      onClick={handleStampDNI}
                      className="p-2 bg-zinc-50 dark:bg-zinc-800/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-left truncate cursor-pointer"
                      title={userPresets.idNumber}
                    >
                      <span className="text-[10px] text-zinc-400 block">{t.idNumberLabel}</span>
                      <span className="truncate block font-semibold text-zinc-800 dark:text-zinc-200">
                        {userPresets.idNumber || t.addPresetPrompt}
                      </span>
                    </button>
                  </div>

                  {/* COMBINED BLOCK STAMP */}
                  <button
                    onClick={handleStampCombinedBlock}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.combinedBlockBtn}</span>
                  </button>
                </div>

                {/* CHECKBOX / TICKS */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                    {t.acceptanceHeading}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleStampCheck}
                      className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>{t.tickLabel}</span>
                    </button>
                    <button
                      onClick={handleStampCross}
                      className="flex items-center justify-center gap-1.5 p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer"
                    >
                      <XSquare className="w-4 h-4" />
                      <span>{t.crossLabel}</span>
                    </button>
                  </div>
                </div>

                {/* PLACED ELEMENTS SUMMARY */}
                {placements.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 px-1">
                      <span>{t.elementsPlacedHeading} ({placements.length}):</span>
                      <button
                        onClick={() => {
                          if (confirm(t.clearAllConfirm)) {
                            setPlacements([]);
                            setSelectedPlacementId(null);
                          }
                        }}
                        className="text-red-500 hover:underline text-[10px] cursor-pointer"
                      >
                        {t.clearAllBtn}
                      </button>
                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1 text-xs">
                      {placements.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedPlacementId(item.id)}
                          className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer text-[11px] ${
                            item.id === selectedPlacementId
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold'
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <span className="truncate">
                            {idx + 1}. {item.label || item.type}: {item.content ? item.content.slice(0, 14) : ''}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlacement(item.id);
                            }}
                            className="text-zinc-400 hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRIMARY DESKTOP DOWNLOAD BUTTON */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                    title={t.downloadSignedPdfDesktop}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.processingBtn}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{t.downloadSignedPdfDesktop} {placements.length > 0 ? `(${placements.length})` : ''}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SIDEBAR FOOTER TIPS */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 space-y-1">
                <div>{t.tipText}</div>
              </div>
            </aside>

            {/* MAIN PDF VIEWER AREA (FULL VIEWPORT ON MOBILE) */}
            <main className="flex-1 h-full overflow-hidden relative">
              <PDFViewer
                pdfBuffer={pdfData.buffer}
                placements={placements}
                onUpdatePlacement={handleUpdatePlacement}
                onUpdateMultiplePlacements={handleUpdateMultiplePlacements}
                onDeletePlacement={handleDeletePlacement}
                onDuplicatePlacement={handleDuplicatePlacement}
                selectedPlacementId={selectedPlacementId}
                onSelectPlacement={setSelectedPlacementId}
                onCanvasClickToPlace={handleCanvasClickToPlace}
                activeTool={activeTool}
                onPageDimensionsChange={handlePageDimensionsChange}
              />
            </main>

            {/* MOBILE FIXED BOTTOM DOCK */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around z-30 backdrop-blur-md shadow-2xl">
              <button
                onClick={() => {
                  if (savedSignatures.length > 0) {
                    handleSelectSignature(savedSignatures[0]);
                  } else {
                    setIsSigModalOpen(true);
                  }
                }}
                className="flex flex-col items-center gap-0.5 p-1 text-blue-600 dark:text-blue-400 active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold">{t.mobileSig}</span>
              </button>

              <button
                onClick={handleStampDate}
                className="flex flex-col items-center gap-0.5 p-1 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold">{t.mobileDate}</span>
              </button>

              <button
                onClick={handleStampCombinedBlock}
                className="flex flex-col items-center gap-0.5 p-1 text-indigo-600 dark:text-indigo-400 active:scale-95 transition-transform cursor-pointer"
                title={t.combinedBlockBtn}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold">{t.mobilePack}</span>
              </button>

              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="flex flex-col items-center gap-0.5 p-1 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold">{t.mobileMore}</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex flex-col items-center gap-0.5 p-1 text-blue-600 dark:text-blue-400 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                title={t.downloadBtn}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md">
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-bold">{t.mobileDownload}</span>
              </button>
            </div>

            {/* MOBILE SLIDE-UP DRAWER */}
            {isMobileDrawerOpen && (
              <div
                className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <div
                  className="bg-white dark:bg-zinc-900 rounded-t-3xl p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4 max-h-[82vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      {t.mobileDrawerTitle}
                    </h4>
                    <button
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* PROMINENT MOBILE DRAWER DOWNLOAD BUTTON */}
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      handleExportPDF();
                    }}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.processingBtn}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{t.mobileDrawerDownloadBtn} {placements.length > 0 ? `(${placements.length})` : ''}</span>
                      </>
                    )}
                  </button>

                  {/* Quick Identification Presets */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-zinc-500">{t.mobileDrawerQuickData}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          handleStampFullName();
                          setIsMobileDrawerOpen(false);
                        }}
                        className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-left border border-zinc-200 dark:border-zinc-700"
                      >
                        <span className="text-[10px] text-zinc-400 block">{t.nameLabel}</span>
                        <span className="text-xs font-bold truncate block">{userPresets.fullName || t.addPresetPrompt}</span>
                      </button>
                      <button
                        onClick={() => {
                          handleStampDNI();
                          setIsMobileDrawerOpen(false);
                        }}
                        className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-left border border-zinc-200 dark:border-zinc-700"
                      >
                        <span className="text-[10px] text-zinc-400 block">{t.idNumberLabel}</span>
                        <span className="text-xs font-bold truncate block">{userPresets.idNumber || t.addPresetPrompt}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        handleStampCombinedBlock();
                        setIsMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t.mobileDrawerCombinedBlock}
                    </button>
                  </div>

                  {/* Cross & other tools */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        handleStampCross();
                        setIsMobileDrawerOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 p-2.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900"
                    >
                      <XSquare className="w-4 h-4" />
                      {t.crossLabel}
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setIsSigModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-900"
                    >
                      <Plus className="w-4 h-4" />
                      {t.addSignature}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                    <button
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setPdfData(null);
                      }}
                      className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 py-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t.changePdfBtn}
                    </button>

                    {placements.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm(t.clearAllConfirm)) {
                            setPlacements([]);
                            setSelectedPlacementId(null);
                            setIsMobileDrawerOpen(false);
                          }
                        }}
                        className="text-red-500 hover:underline"
                      >
                        {t.clearAllBtn} ({placements.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- MODALS ----------------- */}
      <SignaturePadModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSelectSignature={(sig) => {
          refreshSignatures();
          handleSelectSignature(sig);
        }}
      />

      <UserDataPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSavePresets={(presets) => setUserPresets(presets)}
      />

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </div>
  );
}
