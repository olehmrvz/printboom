import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { PDFDocument } from "pdf-lib";

const PDF_W = 3000;
const PDF_H = 4500;

async function imageUrlToPdfBuffer(imageUrl: string): Promise<Buffer> {
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Image download failed: ${imageRes.status}`);
  const imageBytes = new Uint8Array(await imageRes.arrayBuffer());
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PDF_W, PDF_H]);
  const image = await pdfDoc.embedPng(imageBytes);
  page.drawImage(image, { x: 0, y: 0, width: PDF_W, height: PDF_H });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/send-to-print", upload.single("pdf"), async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(503).json({ success: false, error: "Telegram env variables are missing" });
    return;
  }

  const imageUrl = typeof req.body.imageUrl === "string" ? req.body.imageUrl : null;
  const pdfUrl = typeof req.body.pdfUrl === "string" ? req.body.pdfUrl : null;
  let file = req.file;
  const rawNick = String(req.body.instagramNick || "").trim();
  const normalizedNick = rawNick.replace(/^@/, "");

  if ((!file && !imageUrl && !pdfUrl) || !normalizedNick) {
    res.status(400).json({ success: false, error: "Missing PDF/image URL or instagramNick" });
    return;
  }

  try {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const dateStr = `${dd}.${mm}.${yyyy}`;
    const safeNick = normalizedNick.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const caption = `@${normalizedNick} | ${dateStr} | 🆕 Нове`;
    const filename = `printboom_${safeNick}_${dateStr}.pdf`;

    const tgForm = new FormData();
    tgForm.append("chat_id", chatId);
    tgForm.append("caption", caption);

    if (pdfUrl) {
      tgForm.append("document", pdfUrl);
    } else {
      const pdfBuffer = file ? Buffer.from(file.buffer) : await imageUrlToPdfBuffer(imageUrl!);
      tgForm.append(
        "document",
        new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
        filename
      );
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: tgForm,
    });
    const data = await tgRes.json();

    if (!data.ok) {
      res.status(502).json({
        success: false,
        error: data.description || "Telegram API error",
      });
      return;
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to send PDF",
    });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, "0.0.0.0", () => {
  console.log(`Printboom Railway backend listening on ${port}`);
});
