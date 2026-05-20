import {
  PDFDocument,
  PDFPage,
  rgb,
  StandardFonts,
  setLineWidth,
  setStrokingRgbColor,
  setTextRenderingMode,
  setCharacterSpacing,
  TextRenderingMode,
} from "pdf-lib";
import { TypographyConfig, DecorationsConfig } from "@/types";
import { splitText, calcAutoFitFontSize, measureTextWidth } from "./typographyUtils";
import { formatDate } from "./exportUtils";

const FULL_W = 3000;
const FULL_H = 4500;
const PAD_X = 100;
const PAD_TOP = 40;
const GAP_TYPO_COLLAGE = 20;

// PDF page = 2x the standard (720x1080 → 1440x2160)
const PDF_W = 1440;
const PDF_H = 2160;
const SCALE = PDF_W / FULL_W;
const PAD_X_PDF = PAD_X * SCALE;
const RIGHT_COL_W = 1400;
const RIGHT_COL_W_PDF = RIGHT_COL_W * SCALE;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

function processTaglinePdf(
  raw: string,
  fontSize: number,
  fontFamily: string,
  font: any,
  pdfFontSize: number
): string {
  if (!raw) return raw;
  const words = raw.split(/\s+/);
  if (words.length <= 1) return raw;
  const pdfFullWidth = font.widthOfTextAtSize(raw, pdfFontSize);
  if (pdfFullWidth <= RIGHT_COL_W_PDF) return raw;
  const canvasFullWidth = measureTextWidth(raw, fontSize, 0, fontFamily);
  if (canvasFullWidth <= RIGHT_COL_W && pdfFullWidth <= RIGHT_COL_W_PDF) return raw;
  let bestSplit = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const line1 = words.slice(0, i).join(" ");
    const line2 = words.slice(i).join(" ");
    const w1 = font.widthOfTextAtSize(line1, pdfFontSize);
    const w2 = font.widthOfTextAtSize(line2, pdfFontSize);
    if (w1 <= RIGHT_COL_W_PDF && w2 <= RIGHT_COL_W_PDF) {
      const diff = Math.abs(w1 - w2);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSplit = i;
      }
    }
  }
  return words.slice(0, bestSplit).join(" ") + "\n" + words.slice(bestSplit).join(" ");
}

export async function generatePrintPDF(
  typography: TypographyConfig,
  decorations: DecorationsConfig,
  collageDataUrl: string | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PDF_W, PDF_H]);

  // Background color matching preview
  const isLightText = isLightColor(typography.color);
  const bgColor = isLightText ? { r: 23 / 255, g: 23 / 255, b: 23 / 255 } : { r: 244 / 255, g: 244 / 255, b: 240 / 255 };
  page.drawRectangle({
    x: 0, y: 0, width: PDF_W, height: PDF_H,
    color: rgb(bgColor.r, bgColor.g, bgColor.b),
  });

  let font: any;
  try {
    // Use TTF version (converted from OTF, pdf-lib supports TTF)
    const response = await fetch("/fonts/drukwidecyr-bold.ttf");
    if (response.ok) {
      const fontBytes = await response.arrayBuffer();
      font = await pdfDoc.embedFont(fontBytes);
    } else {
      throw new Error("Font not found");
    }
  } catch {
    font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  // Embed raster layer (photos + barcode) — text hidden
  if (collageDataUrl) {
    const base64 = collageDataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pngImage = await pdfDoc.embedPng(bytes);
    page.drawImage(pngImage, {
      x: 0, y: 0, width: PDF_W, height: PDF_H,
    });
  }

  drawTopTextPdf(page, font, typography);
  drawBottomTextPdf(page, font, typography, decorations);

  return await pdfDoc.save();
}

function drawTopTextPdf(page: PDFPage, font: any, typography: TypographyConfig) {
  const collageW = FULL_W - PAD_X * 2;
  const autoFit = calcAutoFitFontSize(typography.text, collageW, typography.fontFamily, 560, 480);
  const fs = autoFit.fontSize;
  const ls = autoFit.letterSpacing;
  const os = Math.max(9, typography.outlineThickness);
  const lineOverlap = fs * 0.35;
  const lines = splitText(typography.text);

  const fillColor = hexToRgb(typography.color);
  const strokeColor = hexToRgb(typography.outlineColor);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isFirst = i === 0;
    const yTop = PAD_TOP + i * lineOverlap;
    const pdfFontSize = fs * SCALE;
    const baselineOffset = pdfFontSize * 0.78;
    const pdfY = PDF_H - yTop * SCALE - baselineOffset;
    const pdfLetterSpacing = ls * SCALE;

    const textWidth =
      font.widthOfTextAtSize(line, pdfFontSize) +
      Math.max(0, line.length - 1) * pdfLetterSpacing;

    let x: number;
    if (typography.alignment === "left") {
      x = PAD_X_PDF;
    } else if (typography.alignment === "right") {
      x = PDF_W - PAD_X_PDF - textWidth;
    } else {
      x = (PDF_W - textWidth) / 2;
    }

    if (isFirst) {
      if (typography.style === "filled") {
        page.pushOperators(setCharacterSpacing(pdfLetterSpacing));
        page.drawText(line, {
          x, y: pdfY, size: pdfFontSize, font,
          color: rgb(fillColor.r, fillColor.g, fillColor.b),
        });
        page.pushOperators(setCharacterSpacing(0));
      } else if (typography.style === "outline") {
        page.pushOperators(
          setLineWidth(os * SCALE),
          setStrokingRgbColor(strokeColor.r, strokeColor.g, strokeColor.b),
          setTextRenderingMode(TextRenderingMode.Outline),
          setCharacterSpacing(pdfLetterSpacing)
        );
        page.drawText(line, { x, y: pdfY, size: pdfFontSize, font });
        page.pushOperators(setTextRenderingMode(TextRenderingMode.Fill), setCharacterSpacing(0));
      } else {
        page.pushOperators(
          setLineWidth(os * SCALE),
          setStrokingRgbColor(strokeColor.r, strokeColor.g, strokeColor.b),
          setTextRenderingMode(TextRenderingMode.FillAndOutline),
          setCharacterSpacing(pdfLetterSpacing)
        );
        page.drawText(line, {
          x, y: pdfY, size: pdfFontSize, font,
          color: rgb(fillColor.r, fillColor.g, fillColor.b),
        });
        page.pushOperators(setTextRenderingMode(TextRenderingMode.Fill), setCharacterSpacing(0));
      }
    } else {
      if (typography.style === "filled") continue;
      page.pushOperators(
        setLineWidth(os * SCALE),
        setStrokingRgbColor(strokeColor.r, strokeColor.g, strokeColor.b),
        setTextRenderingMode(TextRenderingMode.Outline),
        setCharacterSpacing(pdfLetterSpacing)
      );
      page.drawText(line, { x, y: pdfY, size: pdfFontSize, font });
      page.pushOperators(setTextRenderingMode(TextRenderingMode.Fill), setCharacterSpacing(0));
    }
  }
}

function drawBottomTextPdf(
  page: PDFPage,
  font: any,
  typography: TypographyConfig,
  decorations: DecorationsConfig
) {
  const bottomFontSize = decorations.bottomFontSize;
  const pdfFontSize = bottomFontSize * SCALE;
  const baselineOffset = pdfFontSize * 0.78;

  const rawTagline = (decorations.tagline || "").toUpperCase();
  const processedTagline = processTaglinePdf(
    rawTagline, bottomFontSize, typography.fontFamily, font, pdfFontSize
  );

  const taglineLineCount = processedTagline.includes("\n") ? 2 : processedTagline ? 1 : 0;
  const row2HeightPx = bottomFontSize * (taglineLineCount <= 1 ? 1.5 : taglineLineCount);
  const bottomStripHeightPx = bottomFontSize + 20 + row2HeightPx + 20;
  const bottomStripY = FULL_H - bottomStripHeightPx - 40;

  const row1Y = bottomStripY;
  const row2Y = bottomStripY + bottomFontSize + 20;

  const pdfRow1Y = PDF_H - row1Y * SCALE - baselineOffset;
  const pdfRow2Y = PDF_H - row2Y * SCALE - baselineOffset;

  const fillColor = hexToRgb(decorations.bottomTextColor);
  const textColor = rgb(fillColor.r, fillColor.g, fillColor.b);

  // Signature (left)
  if (decorations.signatureEnabled && decorations.signature) {
    page.drawText(decorations.signature.toUpperCase(), {
      x: PAD_X_PDF, y: pdfRow1Y, size: pdfFontSize, font, color: textColor,
    });
  }

  // Date (right-aligned within right column)
  if (decorations.dateEnabled) {
    const text = (decorations.date || formatDate()).toUpperCase();
    const textWidth = font.widthOfTextAtSize(text, pdfFontSize);
    page.drawText(text, {
      x: PDF_W - PAD_X_PDF - textWidth,
      y: pdfRow1Y,
      size: pdfFontSize,
      font,
      color: textColor,
    });
  }

  // Tagline (right-aligned within right column, row2)
  if (decorations.taglineEnabled && processedTagline) {
    const taglineLines = processedTagline.split("\n");
    taglineLines.forEach((line, idx) => {
      const textWidth = font.widthOfTextAtSize(line, pdfFontSize);
      const y = pdfRow2Y - idx * (pdfFontSize * 1.2);
      page.drawText(line, {
        x: PDF_W - PAD_X_PDF - textWidth,
        y,
        size: pdfFontSize,
        font,
        color: textColor,
      });
    });
  }
}
