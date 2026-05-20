export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return Response.json({ success: false, error: "Bot not configured" }, { status: 500 });
  }

  let body: { imageBase64: string; instagramNick: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { imageBase64, instagramNick } = body;
  if (!imageBase64 || !instagramNick) {
    return Response.json(
      { success: false, error: "Missing imageBase64 or instagramNick" },
      { status: 400 }
    );
  }

  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  const buffer = Buffer.from(base64Data, "base64");
  const blob = new Blob([buffer], { type: "image/png" });

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const caption = `@${instagramNick} | ${dd}.${mm}.${yyyy}`;

  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("photo", blob, "printboom.png");
  formData.append("caption", caption);

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!data.ok) {
      return Response.json(
        { success: false, error: data.description || "Telegram API error" },
        { status: 502 }
      );
    }
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message || "Network error" },
      { status: 502 }
    );
  }
}
