import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PDF_W = 3000;
const PDF_H = 4500;

async function imageUrlToPdfFile(imageUrl: string): Promise<File> {
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Image download failed: ${imageRes.status}`);
  const imageBytes = new Uint8Array(await imageRes.arrayBuffer());
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PDF_W, PDF_H]);
  const image = await pdfDoc.embedPng(imageBytes);
  page.drawImage(image, { x: 0, y: 0, width: PDF_W, height: PDF_H });
  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes as unknown as BlobPart], "printboom.pdf", { type: "application/pdf" });
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("[send-to-print] Missing Telegram env vars", {
      hasToken: Boolean(token),
      hasChatId: Boolean(chatId),
    });
    const missing = [
      !token ? "TELEGRAM_BOT_TOKEN" : null,
      !chatId ? "TELEGRAM_CHAT_ID" : null,
    ].filter(Boolean);

    return Response.json(
      {
        success: false,
        error: `Telegram bot is not configured on the server. Missing: ${missing.join(", ")}`,
      },
      { status: 503 }
    );
  }

  let pdf: File | null = null;
  let pdfUrl: string | null = null;
  let imageUrl: string | null = null;
  let instagramNick: string | null = null;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      pdfUrl = typeof body.pdfUrl === "string" ? body.pdfUrl : null;
      imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;
      instagramNick = typeof body.instagramNick === "string" ? body.instagramNick : null;
    } else {
      const fd = await request.formData();
      pdf = fd.get("pdf") as File | null;
      instagramNick = fd.get("instagramNick") as string | null;
    }
  } catch {
    return Response.json({ success: false, error: "Invalid request data" }, { status: 400 });
  }

  if ((!pdf && !pdfUrl && !imageUrl) || !instagramNick) {
    return Response.json(
      { success: false, error: "Missing PDF/PDF URL or instagramNick" },
      { status: 400 }
    );
  }

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const dateStr = `${dd}.${mm}.${yyyy}`;
  const normalizedNick = instagramNick.trim().replace(/^@/, "");
  const caption = `@${normalizedNick} | ${dateStr} | 🆕 Нове`;
  const safeNick = normalizedNick.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filenameBase = `printboom_${safeNick}_${dateStr}`;

  // Send PDF
  try {
    if (!pdf && imageUrl) {
      pdf = await imageUrlToPdfFile(imageUrl);
    }

    const tgForm = new FormData();
    tgForm.append("chat_id", chatId);
    if (pdfUrl) {
      tgForm.append("document", pdfUrl);
    } else if (pdf) {
      const pdfBuf = Buffer.from(await pdf.arrayBuffer());
      tgForm.append("document", new Blob([pdfBuf], { type: "application/pdf" }), `${filenameBase}.pdf`);
    }
    tgForm.append("caption", caption);

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendDocument`,
      { method: "POST", body: tgForm }
    );
    const data = await res.json();
    if (!data.ok) {
      return Response.json(
        { success: false, error: `PDF: ${data.description || "Telegram API error"}` },
        { status: 502 }
      );
    }
  } catch (err: any) {
    return Response.json(
      { success: false, error: `PDF: ${err.message || "Network error"}` },
      { status: 502 }
    );
  }

  return Response.json({ success: true });
}
