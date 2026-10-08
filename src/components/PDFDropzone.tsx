import React, { useState, useRef } from 'react';
import {
  FileUp,
  FileText,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Loader2,
} from 'lucide-react';
import { generateSampleContractPDF } from '../services/samplePdf';
import { useI18n } from '../i18n/I18nContext';

interface PDFDropzoneProps {
  onPDFLoaded: (data: { buffer: ArrayBuffer; fileName: string; fileSize: number }) => void;
}

export const PDFDropzone: React.FC<PDFDropzoneProps> = ({ onPDFLoaded }) => {
  const { t, language } = useI18n();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Validates whether the first 4 bytes of the ArrayBuffer correspond to "%PDF" (0x25 0x50 0x44 0x46)
   */
  const validatePDFMagicNumber = (buffer: ArrayBuffer): boolean => {
    if (buffer.byteLength < 4) return false;
    const bytes = new Uint8Array(buffer.slice(0, 4));
    // %PDF in ascii: 37, 80, 68, 70 (hex 0x25, 0x50, 0x44, 0x46)
    return (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    );
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage(t.dropzoneInvalidFile);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      if (!validatePDFMagicNumber(buffer)) {
        setErrorMessage(t.dropzoneInvalidHeader);
        return;
      }

      onPDFLoaded({
        buffer,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      console.error('Error reading PDF file:', err);
      setErrorMessage(t.dropzoneReadError);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleLoadSample = async () => {
    try {
      setIsLoadingSample(true);
      setErrorMessage(null);
      const sampleBuffer = await generateSampleContractPDF(language);
      const fileName =
        language === 'en'
          ? 'Services_Agreement_Demo.pdf'
          : language === 'zh'
          ? '技术服务与保密协议_演示样本.pdf'
          : 'Contrato_Servicios_Confidencialidad_Demo.pdf';
      onPDFLoaded({
        buffer: sampleBuffer,
        fileName,
        fileSize: sampleBuffer.byteLength,
      });
    } catch (err) {
      console.error('Error loading sample PDF:', err);
      setErrorMessage(t.dropzoneReadError);
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Drop Area Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 scale-[1.01] shadow-2xl ring-4 ring-blue-500/20'
            : 'border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 shadow-lg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          {/* Animated Icon Container */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 cursor-pointer ${
              isDragging
                ? 'bg-blue-600 text-white scale-110 shadow-lg'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:scale-105'
            }`}
          >
            {isDragging ? (
              <FileCheck2 className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
            ) : (
              <FileUp className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {isDragging ? t.dropzoneDragActive : t.dropzoneTitle}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-5">
            {t.dropzoneHint}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <FileText className="w-4 h-4" />
              {t.dropzoneBrowseBtn}
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isLoadingSample}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-xs sm:text-sm rounded-xl border border-blue-200 dark:border-blue-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoadingSample ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>{t.processingBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{t.demoPdfBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Privacy badge callout inside dropzone */}
        <div className="mt-6 pt-5 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{t.privacyBadge}</span>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-3 text-sm text-red-700 dark:text-red-300 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

