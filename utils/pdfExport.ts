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
import { splitText, calcAutoFitFontSize } from "./typographyUtils";
import { formatDate } from "./exportUtils";

const FULL_W = 3000;
const FULL_H = 4500;
const PAD_X = 100;
const PAD_TOP = 40;
const GAP_TYPO_COLLAGE = 20;

// PDF page = 10 x 15 inches = 720 x 1080 points (300 DPI equivalent for 3000x4500 px)
const PDF_W = 720;
const PDF_H = 1080;
const SCALE = PDF_W / FULL_W;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

function dataURLToUint8Array(dataURL: string): Uint8Array {
  const base64 = dataURL.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function generatePDF(
  typography: TypographyConfig,
  decorations: DecorationsConfig,
  collageDataUrl: string | null
): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PDF_W, PDF_H]);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Embed raster layer (photos + barcode, text hidden) only if content exists
  if (collageDataUrl) {
    const pngBytes = dataURLToUint8Array(collageDataUrl);
    const pngImage = await pdfDoc.embedPng(pngBytes);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: PDF_W,
      height: PDF_H,
    });
  }

  // Draw vector text overlays
  drawTopText(page, helveticaBold, typography);
  drawBottomText(page, helveticaBold, typography, decorations);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `printboom-${Date.now()}.pdf`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function drawTopText(page: PDFPage, font: any, typography: TypographyConfig) {
  const collageW = FULL_W - PAD_X * 2;
  const autoFit = calcAutoFitFontSize(
    typography.text,
    collageW,
    typography.fontFamily,
    560,
    480
  );
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
    // Approximate baseline offset for Helvetica Bold (ascent ratio)
    const baselineOffset = pdfFontSize * 0.78;
    const pdfY = PDF_H - yTop * SCALE - baselineOffset;
    const pdfLetterSpacing = ls * SCALE;

    const textWidth =
      font.widthOfTextAtSize(line, pdfFontSize) +
      Math.max(0, line.length - 1) * pdfLetterSpacing;

    let x: number;
    if (typography.alignment === "left") {
      x = PAD_X * SCALE;
    } else if (typography.alignment === "right") {
      x = PDF_W - PAD_X * SCALE - textWidth;
    } else {
      x = (PDF_W - textWidth) / 2;
    }

    if (isFirst) {
      if (typography.style === "filled") {
        page.pushOperators(setCharacterSpacing(pdfLetterSpacing));
        page.drawText(line, {
          x,
          y: pdfY,
          size: pdfFontSize,
          font,
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
        page.drawText(line, {
          x,
          y: pdfY,
          size: pdfFontSize,
          font,
        });
        page.pushOperators(
          setTextRenderingMode(TextRenderingMode.Fill),
          setCharacterSpacing(0)
        );
      } else {
        // both
        page.pushOperators(
          setLineWidth(os * SCALE),
          setStrokingRgbColor(strokeColor.r, strokeColor.g, strokeColor.b),
          setTextRenderingMode(TextRenderingMode.FillAndOutline),
          setCharacterSpacing(pdfLetterSpacing)
        );
        page.drawText(line, {
          x,
          y: pdfY,
          size: pdfFontSize,
          font,
          color: rgb(fillColor.r, fillColor.g, fillColor.b),
        });
        page.pushOperators(
          setTextRenderingMode(TextRenderingMode.Fill),
          setCharacterSpacing(0)
        );
      }
    } else {
      // Subsequent lines are always outline/stroke in the original design
      if (typography.style === "filled") continue;
      page.pushOperators(
        setLineWidth(os * SCALE),
        setStrokingRgbColor(strokeColor.r, strokeColor.g, strokeColor.b),
        setTextRenderingMode(TextRenderingMode.Outline),
        setCharacterSpacing(pdfLetterSpacing)
      );
      page.drawText(line, {
        x,
        y: pdfY,
        size: pdfFontSize,
        font,
      });
      page.pushOperators(
        setTextRenderingMode(TextRenderingMode.Fill),
        setCharacterSpacing(0)
      );
    }
  }
}

function drawBottomText(
  page: PDFPage,
  font: any,
  typography: TypographyConfig,
  decorations: DecorationsConfig
) {
  const bottomFontSize = decorations.bottomFontSize;
  const bottomStripHeight = bottomFontSize * 2 + 40;
  const bottomStripY = FULL_H - bottomStripHeight - 40;
  const row1Y = bottomStripY;
  const row2Y = bottomStripY + bottomFontSize + 20;

  const pdfFontSize = bottomFontSize * SCALE;
  const baselineOffset = pdfFontSize * 0.78;
  const pdfRow1Y = PDF_H - row1Y * SCALE - baselineOffset;
  const pdfRow2Y = PDF_H - row2Y * SCALE - baselineOffset;

  const fillColor = hexToRgb(decorations.bottomTextColor);
  const textColor = rgb(fillColor.r, fillColor.g, fillColor.b);

  // Signature (left)
  if (decorations.signatureEnabled && decorations.signature) {
    const text = decorations.signature.toUpperCase();
    page.drawText(text, {
      x: PAD_X * SCALE,
      y: pdfRow1Y,
      size: pdfFontSize,
      font,
      color: textColor,
    });
  }

  // Date (right)
  if (decorations.dateEnabled) {
    const text = (decorations.date || formatDate()).toUpperCase();
    const textWidth = font.widthOfTextAtSize(text, pdfFontSize);
    page.drawText(text, {
      x: PDF_W - PAD_X * SCALE - textWidth,
      y: pdfRow1Y,
      size: pdfFontSize,
      font,
      color: textColor,
    });
  }

  // Tagline (right, row2)
  if (decorations.taglineEnabled && decorations.tagline) {
    const text = decorations.tagline.toUpperCase();
    const textWidth = font.widthOfTextAtSize(text, pdfFontSize);
    page.drawText(text, {
      x: PDF_W - PAD_X * SCALE - textWidth,
      y: pdfRow2Y,
      size: pdfFontSize,
      font,
      color: textColor,
    });
  }
}
