"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useEditorStore } from "@/store/editorStore";
import TypographySettings from "./TypographySettings";
import CollageSettings from "./CollageSettings";
import DecorationsSettings from "./DecorationsSettings";
import Onboarding from "./Onboarding";

const CanvasPreview = dynamic(() => import("./CanvasPreview"), { ssr: false });

type MobileTab = "typography" | "photos" | "decorations";

export default function EditorLayout() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("photos");
  const canvasRef = useRef<{ openPrintModal: () => void }>(null);
  const { undo, redo, reset } = useEditorStore();

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#0a0a0c] text-white antialiased overflow-hidden">
      {/* Left panel / Mobile bottom sheet */}
      <aside className="w-full md:w-[300px] md:min-w-[300px] bg-[#111114] flex flex-col overflow-hidden shadow-2xl shadow-black/40 relative z-10 order-2 md:order-1 h-[45%] md:h-auto">
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Header */}
        <div className="px-4 md:px-5 py-3 md:py-4 flex items-center justify-between shrink-0">
          <span className="text-[13px] font-bold tracking-[0.25em] text-white/90 uppercase">
            Printboom
          </span>
          {/* Desktop: undo/redo/reset in header */}
          <div className="hidden md:flex items-center gap-1">
            <IconButton onClick={undo} title="Undo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </IconButton>
            <IconButton onClick={redo} title="Redo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
            </IconButton>
            <IconButton onClick={reset} title="Reset all" danger>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </IconButton>
          </div>
        </div>

        {/* Mobile Action Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <MobileIconButton onClick={undo} title="Undo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </MobileIconButton>
            <MobileIconButton onClick={redo} title="Redo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
            </MobileIconButton>
            <MobileIconButton onClick={reset} title="Reset all" danger>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </MobileIconButton>
          </div>
          <button
            onClick={() => canvasRef.current?.openPrintModal()}
            className="px-4 py-2 bg-purple-600 text-white text-[11px] font-semibold rounded-lg hover:bg-purple-500 transition-all uppercase tracking-wider shadow-lg active:scale-95"
          >
            На друк
          </button>
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
        <CanvasPreview ref={canvasRef} />
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

function IconButton({
  onClick,
  title,
  danger,
  children,
}: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 ${
        danger
          ? "text-red-400/80 hover:text-red-300 hover:bg-red-500/15"
          : "text-neutral-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function MobileIconButton({
  onClick,
  title,
  danger,
  children,
}: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 flex items-center justify-center rounded-full bg-neutral-800/60 border border-neutral-700/30 transition-all active:scale-90 ${
        danger
          ? "text-red-400/80 hover:text-red-300 hover:bg-red-500/15"
          : "text-neutral-300 hover:text-white hover:bg-white/10 hover:border-neutral-600/40"
      }`}
    >
      {children}
    </button>
  );
}
