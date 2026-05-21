import { prisma } from "@/lib/prisma";

const STATUS_EMOJI: Record<string, string> = {
  PRINTING: "🖨️",
  DONE: "✅",
  CANCELLED: "❌",
};

const STATUS_LABEL: Record<string, string> = {
  PRINTING: "В друці",
  DONE: "Готове",
  CANCELLED: "Скасоване",
};

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
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

  // Parse callback_data: "status:PRINTING:uuid"
  const match = data.match(/^status:(\w+):(.+)$/);
  if (!match) {
    return Response.json({ ok: true });
  }

  const [, newStatus, orderId] = match;
  const validStatuses = ["PRINTING", "DONE", "CANCELLED"];
  if (!validStatuses.includes(newStatus)) {
    return Response.json({ ok: true });
  }

  // Update order in database
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any },
    });
  } catch (err: any) {
    console.error("Webhook DB error:", err.message);
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id,
        text: "Помилка оновлення статусу",
        show_alert: true,
      }),
    });
    return Response.json({ ok: true });
  }

  // Build updated keyboard with checkmarks
  const updatedKeyboard = [
    [
      {
        text: newStatus === "PRINTING" ? `🖨️ ${STATUS_LABEL.PRINTING} ✅` : `🖨️ ${STATUS_LABEL.PRINTING}`,
        callback_data: `status:PRINTING:${orderId}`,
      },
      {
        text: newStatus === "DONE" ? `✅ ${STATUS_LABEL.DONE} ✅` : `✅ ${STATUS_LABEL.DONE}`,
        callback_data: `status:DONE:${orderId}`,
      },
    ],
    [
      {
        text: newStatus === "CANCELLED" ? `❌ ${STATUS_LABEL.CANCELLED} ✅` : `❌ ${STATUS_LABEL.CANCELLED}`,
        callback_data: `status:CANCELLED:${orderId}`,
      },
    ],
  ];

  // Edit message to reflect status
  const newCaption = msg.caption
    ? `${msg.caption}\n\n${STATUS_EMOJI[newStatus]} Статус: ${STATUS_LABEL[newStatus]}`
    : `${STATUS_EMOJI[newStatus]} Статус: ${STATUS_LABEL[newStatus]}`;

  if (msg.document) {
    // Edit caption for document message
    await fetch(`https://api.telegram.org/bot${token}/editMessageCaption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        caption: newCaption,
        reply_markup: { inline_keyboard: updatedKeyboard },
      }),
    });
  } else {
    // Edit text for regular message
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        text: newCaption,
        reply_markup: { inline_keyboard: updatedKeyboard },
      }),
    });
  }

  // Answer callback
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id,
      text: `Статус оновлено: ${STATUS_LABEL[newStatus]}`,
    }),
  });

  return Response.json({ ok: true });
}
