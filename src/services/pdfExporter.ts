import { PDFDocument, rgb, StandardFonts, RGB } from 'pdf-lib';
import { Placement, PDFPageDimensions } from '../types';

/**
 * Parses hex color string like '#003366' to pdf-lib RGB object
 */
function hexToRgb(hex?: string): RGB {
  if (!hex || !hex.startsWith('#')) {
    return rgb(0, 0.2, 0.4); // default documentary blue
  }
  const clean = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) / 255;
    g = parseInt(clean[1] + clean[1], 16) / 255;
    b = parseInt(clean[2] + clean[2], 16) / 255;
  } else if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16) / 255;
    g = parseInt(clean.substring(2, 4), 16) / 255;
    b = parseInt(clean.substring(4, 6), 16) / 255;
  }
  return rgb(
    Number.isFinite(r) ? r : 0,
    Number.isFinite(g) ? g : 0,
    Number.isFinite(b) ? b : 0
  );
}

/**
 * Converts a base64 DataURL (image/png or image/jpeg) into a Uint8Array
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64Index = dataUrl.indexOf(';base64,');
  if (base64Index === -1) {
    throw new Error('Formato de imagen inválido (se requiere base64 DataURL)');
  }
  const base64String = dataUrl.substring(base64Index + 8);
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Sanitizes string for pdf-lib standard fonts to prevent WinAnsiEncoding exceptions
 */
function sanitizeTextForPdf(text: string): string {
  if (!text) return '';
  return text
    .replace(/[—–]/g, '-')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/[^\x00-\xFF]/g, ''); // strip characters outside standard Latin-1
}

/**
 * Exports the signed PDF with all placed signatures, texts, dates, and checkmarks embedded.
 * Uses exact coordinate transformation from CSS viewport to 72 DPI PDF coordinates.
 */
export async function exportSignedPDF(
  originalBytes: ArrayBuffer,
  placements: Placement[],
  dimensionsMap: Record<number, PDFPageDimensions>
): Promise<Uint8Array> {
  // Load original PDF document with ignoreEncryption to handle protected or permission-tagged documents
  const bytesToLoad = new Uint8Array(originalBytes.slice(0));
  const pdfDoc = await PDFDocument.load(bytesToLoad, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  // Pre-load standard PDF fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Group placements by page
  const placementsByPage: Record<number, Placement[]> = {};
  for (const p of placements) {
    if (!placementsByPage[p.pageNumber]) {
      placementsByPage[p.pageNumber] = [];
    }
    placementsByPage[p.pageNumber].push(p);
  }

  // Iterate over pages that have placements
  for (const pageNumberStr of Object.keys(placementsByPage)) {
    const pageNumber = parseInt(pageNumberStr, 10);
    const pageIndex = pageNumber - 1;

    if (pageIndex < 0 || pageIndex >= pages.length) {
      continue;
    }

    const page = pages[pageIndex];
    const pagePlacements = placementsByPage[pageNumber];

    // Native PDF page dimensions
    const pdfPageHeight = page.getHeight();

    for (const item of pagePlacements) {
      try {
        // Coordinate transformation:
        // item.x, item.y, item.width, item.height are in native PDF page points (origin top-left)
        // In PDF (pdf-lib): origin is bottom-left
        const pdfX = item.x;
        const pdfY = pdfPageHeight - item.y - item.height;
        const pdfW = item.width;
        const pdfH = item.height;

        const itemColor = hexToRgb(item.color);

        if (item.type === 'signature' && item.content) {
          try {
            const imgBytes = dataUrlToBytes(item.content);
            const isJpg = item.content.startsWith('data:image/jpeg') || item.content.startsWith('data:image/jpg');
            const embeddedImg = isJpg
              ? await pdfDoc.embedJpg(imgBytes)
              : await pdfDoc.embedPng(imgBytes);

            page.drawImage(embeddedImg, {
              x: pdfX,
              y: pdfY,
              width: pdfW,
              height: pdfH,
            });
          } catch (err) {
            console.error('Error al incrustar firma en PDF:', err);
          }
        } else if (item.type === 'text' || item.type === 'date' || item.type === 'id_badge') {
          const rawText = item.content || '';
          const text = sanitizeTextForPdf(rawText);
          if (text.length > 0) {
            let chosenFont = fontHelvetica;
            if (item.fontFamily === 'TimesRoman') chosenFont = fontTimes;
            else if (item.fontFamily === 'Courier') chosenFont = fontCourier;
            else if (item.isBold) chosenFont = fontHelveticaBold;

            const pdfFontSize = item.fontSize || 13;

            // In PDF, text baseline is at the bottom, so lift it slightly
            const textY = pdfY + pdfH * 0.22;

            page.drawText(text, {
              x: pdfX,
              y: textY,
              size: pdfFontSize,
              font: chosenFont,
              color: itemColor,
            });
          }
        } else if (item.type === 'check') {
          // Crisp vector checkmark drawn with lines
          const strokeThickness = 2.2;
          const checkColor = item.color ? hexToRgb(item.color) : rgb(0.08, 0.6, 0.25); // default green/documentary

          // Point 1: start of check
          const p1x = pdfX + pdfW * 0.18;
          const p1y = pdfY + pdfH * 0.46;
          // Point 2: bottom vertex of check
          const p2x = pdfX + pdfW * 0.42;
          const p2y = pdfY + pdfH * 0.20;
          // Point 3: top flourish of check
          const p3x = pdfX + pdfW * 0.86;
          const p3y = pdfY + pdfH * 0.80;

          page.drawLine({
            start: { x: p1x, y: p1y },
            end: { x: p2x, y: p2y },
            thickness: strokeThickness,
            color: checkColor,
          });

          page.drawLine({
            start: { x: p2x, y: p2y },
            end: { x: p3x, y: p3y },
            thickness: strokeThickness,
            color: checkColor,
          });
        } else if (item.type === 'cross') {
          // Crisp vector cross (X)
          const strokeThickness = 2.2;
          const crossColor = item.color ? hexToRgb(item.color) : rgb(0.8, 0.15, 0.15);

          // Diagonal 1: bottom-left to top-right
          page.drawLine({
            start: { x: pdfX + pdfW * 0.22, y: pdfY + pdfH * 0.22 },
            end: { x: pdfX + pdfW * 0.78, y: pdfY + pdfH * 0.78 },
            thickness: strokeThickness,
            color: crossColor,
          });

          // Diagonal 2: top-left to bottom-right
          page.drawLine({
            start: { x: pdfX + pdfW * 0.22, y: pdfY + pdfH * 0.78 },
            end: { x: pdfX + pdfW * 0.78, y: pdfY + pdfH * 0.22 },
            thickness: strokeThickness,
            color: crossColor,
          });
        }
      } catch (itemErr) {
        console.warn('Error al procesar elemento en PDF:', itemErr);
      }
    }
  }

  // Save the updated PDF bytes
  return await pdfDoc.save();
}

/**
 * Triggers browser download of the generated PDF
 */
export function downloadPDF(pdfBytes: Uint8Array, fileName: string): string {
  const safeBytes = new Uint8Array(pdfBytes);
  const blob = new Blob([safeBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return url;
}
