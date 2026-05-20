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

  const photo = fd.get("photo") as File | null;
  const instagramNick = fd.get("instagramNick") as string | null;

  if (!photo || !instagramNick) {
    return Response.json(
      { success: false, error: "Missing photo or instagramNick" },
      { status: 400 }
    );
  }

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const caption = `@${instagramNick} | ${dd}.${mm}.${yyyy}`;
  const filename = `printboom_${instagramNick}_${dd}.${mm}.${yyyy}.png`;

  const buffer = Buffer.from(await photo.arrayBuffer());

  const tgForm = new FormData();
  tgForm.append("chat_id", chatId);
  tgForm.append("document", new Blob([buffer], { type: "image/png" }), filename);
  tgForm.append("caption", caption);

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendDocument`,
      { method: "POST", body: tgForm }
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
