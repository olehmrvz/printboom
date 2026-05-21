"use client";

import { useState } from "react";

interface PrintModalProps {
  onClose: () => void;
  onSubmit: (nick: string) => Promise<void>;
  status: "idle" | "sending" | "success" | "error";
  errorMsg?: string;
  previewUrl?: string | null;
}

export default function PrintModal({ onClose, onSubmit, status, errorMsg, previewUrl }: PrintModalProps) {
  const [screen, setScreen] = useState<1 | 2>(1);
  const [nick, setNick] = useState("");
  const [designConfirmed, setDesignConfirmed] = useState(false);
  const [nickConfirmed, setNickConfirmed] = useState(false);

  const isValidNick = /^[a-zA-Z0-9_.]+$/.test(nick.trim().replace(/^@/, ""));

  const handleNext = () => {
    const trimmed = nick.trim().replace(/^@/, "");
    if (!trimmed || !isValidNick) return;
    setNick(trimmed);
    setScreen(2);
  };

  const handleChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9_.]/g, "");
    setNick(cleaned);
  };

  const handleSubmit = () => {
    if (!designConfirmed || !nickConfirmed) return;
    onSubmit(nick);
  };

  if (status === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 px-4">
        <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-5 md:p-6 w-full max-w-[320px] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Відправлено!</h2>
          <p className="text-[13px] text-neutral-400">Замовлення надіслано менеджеру</p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all"
          >
            Гаразд
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 px-4">
        <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-5 md:p-6 w-full max-w-[320px] text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Помилка</h2>
          <p className="text-[13px] text-neutral-400">{errorMsg || "Не вдалося відправити"}</p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all"
          >
            Закрити
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 px-4">
      <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-5 md:p-6 w-full max-w-[360px] space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
              screen === 1 ? "bg-white text-black" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {screen === 1 ? "1" : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
              screen === 2 ? "bg-white text-black" : "bg-neutral-800 text-neutral-500"
            }`}>
              2
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white">
            {screen === 1 ? "Надіслати на друк" : "Перевірка замовлення"}
          </h2>
        </div>

        {/* Screen 1: Instagram nick */}
        {screen === 1 && (
          <>
            <div>
              <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block mb-2">
                Ваш Instagram нік
              </label>
              <div className="flex items-center bg-neutral-800/50 border border-neutral-700/40 rounded-xl overflow-hidden focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/10 transition-all">
                <span className="pl-4 text-neutral-500 text-sm">@</span>
                <input
                  type="text"
                  value={nick}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="koxayou_print"
                  autoFocus
                  className="flex-1 bg-transparent text-white text-base md:text-sm px-2 py-3.5 outline-none placeholder:text-neutral-600"
                />
              </div>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Лише латиниця (a-z, 0-9)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Перевірте написання з Instagram</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>За цим ніком ми знайдемо замовлення</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={status === "sending"}
                className="flex-1 py-3 rounded-xl bg-neutral-800/60 text-white text-sm font-medium hover:bg-neutral-700/60 transition-all disabled:opacity-40"
              >
                Скасувати
              </button>
              <button
                onClick={handleNext}
                disabled={!nick.trim().replace(/^@/, "") || !isValidNick}
                className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <span>Далі</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </>
        )}

        {/* Screen 2: Review */}
        {screen === 2 && (
          <>
            <div className="space-y-4">
              {/* Preview */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Ваш дизайн
                </label>
                <div className="relative rounded-xl overflow-hidden border border-neutral-700/40 bg-neutral-900/50">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Прев'ю дизайну"
                      className="w-full h-auto object-contain max-h-[200px]"
                    />
                  ) : (
                    <div className="w-full h-[120px] flex items-center justify-center text-neutral-500 text-[12px]">
                      Завантаження прев'ю...
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer group py-1">
                  <div className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    designConfirmed
                      ? "bg-white border-white"
                      : "border-neutral-500 group-hover:border-neutral-400"
                  }`}>
                    {designConfirmed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[12px] text-neutral-300">Я перевірив дизайн — все вірно</span>
                  <input
                    type="checkbox"
                    checked={designConfirmed}
                    onChange={(e) => setDesignConfirmed(e.target.checked)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Checkbox: Nick confirmed */}
              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl bg-neutral-800/30 border border-neutral-700/20 hover:border-neutral-600/30 transition-all">
                <div className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                  nickConfirmed
                    ? "bg-white border-white"
                    : "border-neutral-500 group-hover:border-neutral-400"
                }`}>
                  {nickConfirmed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-white">Підтвердить, що ваш нік правильно написан</div>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    <span className="text-[13px] font-semibold text-purple-300">@{nick}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Все правильно, ми знайдемо вас за цим ніком
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={nickConfirmed}
                  onChange={(e) => setNickConfirmed(e.target.checked)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <div className="text-[12px] font-medium text-amber-200">Увага</div>
                <div className="text-[11px] text-amber-300/80 mt-0.5">
                  Після натискання «Відправити» внести зміни буде неможливо. Цех починає виготовлення принта автоматично.
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setScreen(1)}
                disabled={status === "sending"}
                className="flex-1 py-3 rounded-xl bg-neutral-800/60 text-white text-sm font-medium hover:bg-neutral-700/60 transition-all disabled:opacity-40"
              >
                Назад
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === "sending" || !designConfirmed || !nickConfirmed}
                className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {status === "sending" ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" opacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Надсилання...
                  </>
                ) : (
                  "Відправити"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
