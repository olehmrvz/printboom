"use client";

import { useState } from "react";

interface PrintModalProps {
  onClose: () => void;
  onSubmit: (nick: string) => Promise<void>;
  status: "idle" | "sending" | "success" | "error";
  errorMsg?: string;
}

export default function PrintModal({ onClose, onSubmit, status, errorMsg }: PrintModalProps) {
  const [nick, setNick] = useState("");

  const handleSubmit = () => {
    const trimmed = nick.trim().replace(/^@/, "");
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  if (status === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-6 w-[320px] text-center space-y-4">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-6 w-[320px] text-center space-y-4">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-6 w-[320px] space-y-5">
        <h2 className="text-lg font-semibold text-white">Надіслати на друк</h2>

        <div>
          <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block mb-2">
            Instagram нік
          </label>
          <div className="flex items-center bg-neutral-800/50 border border-neutral-700/40 rounded-xl overflow-hidden focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/10 transition-all">
            <span className="pl-4 text-neutral-500 text-sm">@</span>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="koxayou_print"
              autoFocus
              className="flex-1 bg-transparent text-white text-sm px-2 py-3.5 outline-none placeholder:text-neutral-600"
            />
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
            onClick={handleSubmit}
            disabled={status === "sending" || !nick.trim().replace(/^@/, "")}
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
      </div>
    </div>
  );
}
