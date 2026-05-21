export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return Response.json({ success: false, error: "Bot not configured" }, { status: 500 });
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return Response.json({ success: false, error: "Invalid form data" }, { status: 400 });
  }

  const pdf = fd.get("pdf") as File | null;
  const instagramNick = fd.get("instagramNick") as string | null;

  if (!pdf || !instagramNick) {
    return Response.json(
      { success: false, error: "Missing PDF or instagramNick" },
      { status: 400 }
    );
  }

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const caption = `@${instagramNick} | ${dd}.${mm}.${yyyy}`;
  const filenameBase = `printboom_${instagramNick}_${dd}.${mm}.${yyyy}`;

  const pdfBuf = Buffer.from(await pdf.arrayBuffer());

  // Send PDF
  try {
    const tgForm = new FormData();
    tgForm.append("chat_id", chatId);
    tgForm.append("document", new Blob([pdfBuf], { type: "application/pdf" }), `${filenameBase}.pdf`);
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

  // Send order separator
  try {
    await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "\n━━━━━━━━━━━━━━━━━━━━\n📦 ЗАМОВЛЕННЯ НАДІСЛАНО\n━━━━━━━━━━━━━━━━━━━━\n",
          parse_mode: "HTML",
        }),
      }
    );
  } catch (err: any) {
    console.error("Separator send error:", err.message);
  }

  return Response.json({ success: true });
}
