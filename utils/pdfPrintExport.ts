import { PDFDocument } from "pdf-lib";

const PDF_W = 1440;
const PDF_H = 2160;

export async function generatePrintPDF(
  _textColor: string,
  fullDataUrl: string | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PDF_W, PDF_H]);

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
