import { PDFDocument } from "pdf-lib";

const PDF_W = 3000;
const PDF_H = 4500;

export async function generatePrintPDF(
  _textColor: string,
  fullDataUrl: string | null,
  width = PDF_W,
  height = PDF_H
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  // Embed full raster (photos + text + barcode + everything) at print quality
  if (fullDataUrl) {
    const base64 = fullDataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const image = fullDataUrl.startsWith("data:image/jpeg") || fullDataUrl.startsWith("data:image/jpg")
      ? await pdfDoc.embedJpg(bytes)
      : await pdfDoc.embedPng(bytes);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}
