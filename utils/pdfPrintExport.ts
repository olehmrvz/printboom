import {
  PDFDocument,
  rgb,
} from "pdf-lib";

const PDF_W = 1440;
const PDF_H = 2160;

function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export async function generatePrintPDF(
  textColor: string,
  fullDataUrl: string | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PDF_W, PDF_H]);

  // Background color matching preview
  const isLightText = isLightColor(textColor);
  const bgColor = isLightText
    ? { r: 23 / 255, g: 23 / 255, b: 23 / 255 }
    : { r: 244 / 255, g: 244 / 255, b: 240 / 255 };
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PDF_W,
    height: PDF_H,
    color: rgb(bgColor.r, bgColor.g, bgColor.b),
  });

  // Embed full raster (photos + text + barcode + everything) at print quality
  if (fullDataUrl) {
    const base64 = fullDataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pngImage = await pdfDoc.embedPng(bytes);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: PDF_W,
      height: PDF_H,
    });
  }

  return await pdfDoc.save();
}
