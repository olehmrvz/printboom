"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import TypographySettings from "./TypographySettings";
import CollageSettings from "./CollageSettings";
import DecorationsSettings from "./DecorationsSettings";
import Onboarding from "./Onboarding";

const CanvasPreview = dynamic(() => import("./CanvasPreview"), { ssr: false });

type MobileTab = "typography" | "photos" | "decorations";

export default function EditorLayout() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("photos");

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#0a0a0c] text-white antialiased overflow-hidden">
      {/* Left panel / Mobile bottom sheet */}
      <aside className="w-full md:w-[300px] md:min-w-[300px] bg-[#111114] flex flex-col overflow-hidden shadow-2xl shadow-black/40 relative z-10 order-2 md:order-1 h-[45%] md:h-auto">
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Header */}
        <div className="px-4 md:px-5 py-3 md:py-4 flex items-center shrink-0">
          <span className="text-[13px] font-bold tracking-[0.25em] text-white/90 uppercase">
            Printboom
          </span>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex items-center gap-1 px-2 pb-2 shrink-0">
          <MobileTabButton tab="typography" active={mobileTab} onClick={setMobileTab} label="Текст" />
          <MobileTabButton tab="photos" active={mobileTab} onClick={setMobileTab} label="Фото" />
          <MobileTabButton tab="decorations" active={mobileTab} onClick={setMobileTab} label="Декор" />
        </div>

        {/* Settings */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-2 space-y-5 scrollbar-thin pb-safe">
          {/* Mobile: only active tab */}
          <div className="md:hidden">
            {mobileTab === "typography" && <TypographySettings />}
            {mobileTab === "photos" && <CollageSettings />}
            {mobileTab === "decorations" && <DecorationsSettings />}
          </div>
          {/* Desktop: all sections */}
          <div className="hidden md:block space-y-5">
            <TypographySettings />
            <SectionDivider />
            <CollageSettings />
            <SectionDivider />
            <DecorationsSettings />
          </div>
          <div className="h-6" />
        </div>
      </aside>

      {/* Right preview */}
      <main className="flex-1 relative overflow-hidden order-1 md:order-2 h-[55%] md:h-auto">
        <CanvasPreview />
      </main>

      <Onboarding onTabChange={(tab) => setMobileTab(tab)} />
    </div>
  );
}

function MobileTabButton({
  tab,
  active,
  onClick,
  label,
}: {
  tab: MobileTab;
  active: MobileTab;
  onClick: (t: MobileTab) => void;
  label: string;
}) {
  const isActive = active === tab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200 border ${
        isActive
          ? "bg-white text-black border-white shadow-lg shadow-white/10"
          : "bg-neutral-800/40 text-neutral-400 border-neutral-700/30 hover:bg-neutral-800/70 hover:text-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}

function SectionDivider() {
  return (
    <div className="relative h-px my-1">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
    </div>
  );
}
