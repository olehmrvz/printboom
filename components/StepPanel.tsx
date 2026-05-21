"use client";

import { useRef, useEffect, useState } from "react";

interface StepPanelProps {
  step: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onNext?: () => void;
  showNext?: boolean;
  nextLabel?: string;
  children: React.ReactNode;
  badge?: string;
}

export default function StepPanel({
  step,
  title,
  isActive,
  isCompleted,
  onToggle,
  onNext,
  showNext = false,
  nextLabel = "Далі",
  children,
  badge,
}: StepPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(isActive ? undefined : 0);

  useEffect(() => {
    if (isActive && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isActive, children]);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isActive
          ? "bg-neutral-800/20 border-neutral-700/40"
          : "bg-transparent border-transparent hover:bg-neutral-800/10 hover:border-neutral-700/20"
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-3 md:px-3 md:py-2.5 text-left"
      >
        {/* Step indicator */}
        <div
          className={`shrink-0 w-7 h-7 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[11px] md:text-[10px] font-bold transition-all duration-200 ${
            isCompleted
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : isActive
              ? "bg-white text-black"
              : "bg-neutral-800/60 text-neutral-500 border border-neutral-700/30"
          }`}
        >
          {isCompleted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            step
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[13px] md:text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                isActive ? "text-white" : isCompleted ? "text-neutral-300" : "text-neutral-500"
              }`}
            >
              {title}
            </span>
            {badge && (
              <span className="text-[10px] text-neutral-500 font-mono">{badge}</span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-neutral-500 transition-transform duration-300 shrink-0 ${
            isActive ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-[height] duration-300 ease-out"
        style={{ height }}
      >
        <div ref={contentRef} className="px-3 pb-4 md:px-3 md:pb-3 space-y-4 md:space-y-3">
          {children}

          {showNext && onNext && (
            <div className="pt-1">
              <button
                onClick={onNext}
                className="w-full py-2.5 md:py-2 bg-white text-black text-[12px] md:text-[11px] font-semibold rounded-xl hover:bg-neutral-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{nextLabel}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
