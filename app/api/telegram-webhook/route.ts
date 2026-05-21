const STATUS_EMOJI: Record<string, string> = {
  PRINTING: "🖨️",
  DONE: "✅",
  CANCELLED: "❌",
  NEW: "🆕",
};

const STATUS_LABEL: Record<string, string> = {
  PRINTING: "В друці",
  DONE: "Готове",
  CANCELLED: "Скасоване",
  NEW: "Нове",
};

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return Response.json({ ok: true });
  }

  const body = await request.json().catch(() => ({}));
  const callbackQuery = body.callback_query;

  if (!callbackQuery) {
    return Response.json({ ok: true });
  }

  const data = callbackQuery.data as string;
  const msg = callbackQuery.message;
  if (!data || !msg) {
    return Response.json({ ok: true });
  }

  console.log("[TG Webhook] callback_data:", data, "msg.caption:", msg.caption, "hasDocument:", !!msg.document);

  // Parse callback_data: "status:PRINTING"
  const match = data.match(/^status:(\w+)$/);
  if (!match) {
    return Response.json({ ok: true });
  }

  const [, newStatus] = match;
  const validStatuses = ["PRINTING", "DONE", "CANCELLED"];
  if (!validStatuses.includes(newStatus)) {
    return Response.json({ ok: true });
  }

  // Extract nick and date from current caption
  // Expected format: "@nick | DD.MM.YYYY | 🆕 Нове"
  let currentCaption = msg.caption || "";
  const parts = currentCaption.split(" | ");
  const nick = parts[0] || "@unknown";
  const dateStr = parts[1] || "";

  // Build new caption
  const newCaption = `${nick} | ${dateStr} | ${STATUS_EMOJI[newStatus]} ${STATUS_LABEL[newStatus]}`;

  // Build updated keyboard with checkmark on selected
  const updatedKeyboard = [
    [
      {
        text: newStatus === "PRINTING" ? `🖨️ В друк ✅` : `🖨️ В друк`,
        callback_data: `status:PRINTING`,
      },
      {
        text: newStatus === "DONE" ? `✅ Готове ✅` : `✅ Готове`,
        callback_data: `status:DONE`,
      },
    ],
    [
      {
        text: newStatus === "CANCELLED" ? `❌ Скасувати ✅` : `❌ Скасувати`,
        callback_data: `status:CANCELLED`,
      },
    ],
  ];

  // Edit message caption (works for any message with caption, document or not)
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/editMessageCaption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        caption: newCaption,
        reply_markup: { inline_keyboard: updatedKeyboard },
      }),
    });
    const tgData = await res.json();
    console.log("[TG Webhook] editMessageCaption response:", JSON.stringify(tgData));
    if (!tgData.ok) {
      console.error("[TG Webhook] editMessageCaption failed:", tgData.description);
    }
  } catch (err: any) {
    console.error("[TG Webhook] editMessageCaption error:", err.message);
  }

  // Answer callback
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id,
      text: `Статус: ${STATUS_LABEL[newStatus]}`,
    }),
  });

  return Response.json({ ok: true });
}
