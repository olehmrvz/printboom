"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useEditorStore } from "@/store/editorStore";
import { DEFAULT_TYPOGRAPHY, DEFAULT_DECORATIONS } from "@/types";
import StepPanel from "./StepPanel";
import TypographySettings from "./TypographySettings";
import CollageSettings from "./CollageSettings";
import DecorationsSettings from "./DecorationsSettings";
import Onboarding from "./Onboarding";

const CanvasPreview = dynamic(() => import("./CanvasPreview"), { ssr: false });

type MobileTab = "typography" | "photos" | "decorations";

export default function EditorLayout() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("typography");
  const [activeStep, setActiveStep] = useState(1);
  const canvasRef = useRef<{ openPrintModal: () => void }>(null);
  const { typography, collage, decorations, undo, redo, reset } = useEditorStore();

  // Completion logic: only count as completed when user explicitly changed content from defaults
  const step1Completed =
    typography.template !== "CUSTOM" ||
    (typography.template === "CUSTOM" && typography.text !== DEFAULT_TYPOGRAPHY.text);
  const step2Completed = collage.photos.length >= 6;
  const step3Completed =
    decorations.noText ||
    (decorations.signatureEnabled && decorations.signature !== DEFAULT_DECORATIONS.signature) ||
    (decorations.dateEnabled && !!decorations.date && decorations.date.length > 0) ||
    (decorations.taglineEnabled && decorations.tagline !== DEFAULT_DECORATIONS.tagline);

  const allStepsCompleted = step1Completed && step2Completed && step3Completed;
  const completedCount = [step1Completed, step2Completed, step3Completed].filter(Boolean).length;

  const goToStep = (step: number) => {
    setActiveStep(step);
  };

  const goToNextTab = () => {
    if (mobileTab === "typography") setMobileTab("photos");
    else if (mobileTab === "photos") setMobileTab("decorations");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen h-[100dvh] bg-[#0a0a0c] text-white antialiased overflow-hidden">
      {/* Left panel / Mobile bottom sheet */}
      <aside className="w-full md:w-[320px] md:min-w-[320px] bg-[#111114] flex flex-col overflow-hidden shadow-2xl shadow-black/40 relative z-10 order-2 md:order-1 h-[45%] md:h-auto">
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Header */}
        <div className="px-4 md:px-5 py-3 md:py-4 flex items-center justify-between shrink-0">
          <img src="/logo.png" alt="Printboom" className="h-5 md:h-6 w-auto object-contain" />
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
        <div className="md:hidden flex items-center gap-1.5 px-4 py-2 shrink-0 border-b border-white/5">
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

        {/* Mobile Tabs */}
        <div className="md:hidden flex items-center gap-1 px-2 pb-2 shrink-0">
          <MobileTabButton tab="typography" active={mobileTab} onClick={setMobileTab} label="Текст" />
          <MobileTabButton tab="photos" active={mobileTab} onClick={setMobileTab} label="Фото" />
          <MobileTabButton tab="decorations" active={mobileTab} onClick={setMobileTab} label="Декор" />
        </div>

        {/* Settings */}
        <div className="flex-1 overflow-y-auto px-4 md:px-3 py-2 space-y-2 scrollbar-thin pb-safe">
          {/* Mobile: tab content with Next buttons */}
          <div className="md:hidden space-y-3">
            {mobileTab === "typography" && (
              <div className="space-y-3">
                <StepPanel
                  step={1}
                  title="Текст"
                  isActive={true}
                  isCompleted={step1Completed}
                  onToggle={() => {}}
                  showNext={true}
                  onNext={goToNextTab}
                >
                  <TypographySettings hideHeader />
                </StepPanel>
              </div>
            )}
            {mobileTab === "photos" && (
              <div className="space-y-3">
                <StepPanel
                  step={2}
                  title="Фото"
                  isActive={true}
                  isCompleted={step2Completed}
                  onToggle={() => {}}
                  badge={`${collage.photos.length}/12`}
                  showNext={true}
                  onNext={goToNextTab}
                >
                  <CollageSettings hideHeader />
                </StepPanel>
              </div>
            )}
            {mobileTab === "decorations" && (
              <div className="space-y-3">
                <StepPanel
                  step={3}
                  title="Декорації"
                  isActive={true}
                  isCompleted={step3Completed}
                  onToggle={() => {}}
                  showNext={false}
                >
                  <DecorationsSettings hideHeader />
                </StepPanel>
              </div>
            )}
          </div>

          {/* Desktop: step wizard */}
          <div className="hidden md:block space-y-2">
            <StepPanel
              step={1}
              title="Текст"
              isActive={activeStep === 1}
              isCompleted={step1Completed}
              onToggle={() => goToStep(activeStep === 1 ? 0 : 1)}
              showNext={activeStep === 1}
              onNext={() => goToStep(2)}
            >
              <TypographySettings hideHeader />
            </StepPanel>

            <StepPanel
              step={2}
              title="Фото"
              isActive={activeStep === 2}
              isCompleted={step2Completed}
              onToggle={() => goToStep(activeStep === 2 ? 0 : 2)}
              badge={`${collage.photos.length}/12`}
              showNext={activeStep === 2}
              onNext={() => goToStep(3)}
            >
              <CollageSettings hideHeader />
            </StepPanel>

            <StepPanel
              step={3}
              title="Декорації"
              isActive={activeStep === 3}
              isCompleted={step3Completed}
              onToggle={() => goToStep(activeStep === 3 ? 0 : 3)}
              showNext={false}
            >
              <DecorationsSettings hideHeader />
            </StepPanel>
          </div>

          {/* Print Button */}
          <div className="px-3 py-2 md:px-2">
            <button
              data-onboarding="export"
              onClick={() => canvasRef.current?.openPrintModal()}
              disabled={!allStepsCompleted}
              className={`w-full py-3 md:py-2.5 rounded-xl text-[13px] md:text-[11px] font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 ${
                allStepsCompleted
                  ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-900/30 active:scale-[0.98]"
                  : "bg-neutral-800/50 text-neutral-500 cursor-not-allowed border border-neutral-700/30"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>На друк</span>
              {!allStepsCompleted && (
                <span className="text-[10px] font-mono opacity-60">({completedCount}/3)</span>
              )}
            </button>
            {!allStepsCompleted && (
              <p className="text-[10px] text-neutral-500 text-center mt-2">
                Виконайте всі 3 кроки, щоб відправити на друк
              </p>
            )}
          </div>

          <div className="hidden md:flex items-center justify-center gap-3 px-2 pb-3 pt-1 text-[10px] text-neutral-600">
            <Link href="/privacy" className="hover:text-neutral-300">Privacy Policy</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-neutral-300">Cookies</Link>
          </div>

          <div className="h-6" />
        </div>
      </aside>

      {/* Right preview */}
      <main className="flex-1 relative overflow-hidden order-1 md:order-2 h-[55%] md:h-auto">
        <CanvasPreview ref={canvasRef} />
      </main>

      <Onboarding onTabChange={(tab) => setMobileTab(tab)} onStepChange={(step) => setActiveStep(step)} />
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
