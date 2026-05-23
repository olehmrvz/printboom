"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "printboom_cookie_notice_closed";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    setVisible(true);

    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
    }, 9000);

    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[80] md:left-auto md:right-4 md:bottom-4 md:max-w-[420px] rounded-2xl border border-white/10 bg-[#111114]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">🍪</div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold text-white">Cookies та аналітика</div>
          <p className="mt-1 text-[11px] leading-4 text-neutral-400">
            Ми використовуємо необхідні cookies/localStorage для роботи сайту та Vercel Web Analytics/Speed Insights для анонімної статистики швидкості й відвідувань.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <Link href="/privacy" className="text-neutral-300 underline underline-offset-4 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-neutral-300 underline underline-offset-4 hover:text-white">
              Cookie Policy
            </Link>
          </div>
        </div>
        <button
          onClick={close}
          className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-neutral-200"
        >
          Ок
        </button>
      </div>
    </div>
  );
}
