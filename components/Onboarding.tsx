"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";

export type OnboardingTab = "typography" | "photos" | "decorations";

interface Step {
  selector: string;
  title: string;
  description: string;
  tab?: OnboardingTab;
}

const STEPS: Step[] = [
  {
    selector: '[data-onboarding="templates"]',
    title: "Виберіть текст",
    description: "Оберіть готовий шаблон або введіть свій текст.",
    tab: "typography",
  },
  {
    selector: '[data-onboarding="colors"]',
    title: "Налаштуйте кольори",
    description: "Виберіть колірний пресет або задайте власні кольори.",
    tab: "typography",
  },
  {
    selector: '[data-onboarding="photos"]',
    title: "Завантажте фото",
    description: "Натисніть сюди або перетягніть 6–12 фотографій для колажу.",
    tab: "photos",
  },
  {
    selector: '[data-onboarding="layout"]',
    title: "Розкладка колажу",
    description: "Виберіть сітку для розташування фотографій.",
    tab: "photos",
  },
  {
    selector: '[data-onboarding="decorations"]',
    title: "Додайте декорації",
    description: "Підпис, дата, штрихкод і слоган унизу колажу.",
    tab: "decorations",
  },
  {
    selector: '[data-onboarding="export"]',
    title: "Відправте на друк",
    description: "Натисніть 'На друк' і введіть свій Instagram. Ми зробимо PDF і надрукуємо.",
  },
  {
    selector: '[data-onboarding="undo"]',
    title: "Скасування дій",
    description: "Використовуйте Undo / Redo або скиньте все кнопкою Reset.",
  },
];

export default function Onboarding({
  onTabChange,
  onStepChange,
}: {
  onTabChange?: (tab: OnboardingTab) => void;
  onStepChange?: (step: number) => void;
}) {
  const { hasCompletedOnboarding, completeOnboarding } = useEditorStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const STEP_TAB_TO_DESKTOP_STEP: Record<string, number> = {
    typography: 1,
    photos: 2,
    decorations: 3,
  };

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setIsVisible(true);
    }
  }, [hasCompletedOnboarding]);

  const updateRect = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step) return;

    if (step.tab) {
      if (onTabChange) onTabChange(step.tab);
      if (onStepChange) onStepChange(STEP_TAB_TO_DESKTOP_STEP[step.tab]);
    }

    requestAnimationFrame(() => {
      const el = document.querySelector(step.selector);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    });
  }, [currentStep, onTabChange, onStepChange]);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => updateRect(), 100);

    const handleResize = () => updateRect();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible, updateRect]);

  const handleSkip = () => {
    completeOnboarding();
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep >= STEPS.length - 1) {
      handleSkip();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const padding = 10;

  const holeLeft = rect ? rect.left - padding : 0;
  const holeTop = rect ? rect.top - padding : 0;
  const holeRight = rect ? rect.left + rect.width + padding : 0;
  const holeBottom = rect ? rect.top + rect.height + padding : 0;

  const tooltipWidth = 280;
  let tooltipLeft = rect ? rect.left + rect.width / 2 - tooltipWidth / 2 : 16;
  let tooltipTop = rect ? holeBottom + 16 : 100;
  let tooltipArrow: "top" | "bottom" | null = "top";

  if (typeof window !== "undefined") {
    if (tooltipLeft < 16) tooltipLeft = 16;
    if (tooltipLeft + tooltipWidth > window.innerWidth - 16) {
      tooltipLeft = window.innerWidth - tooltipWidth - 16;
    }
    if (tooltipTop + 220 > window.innerHeight && rect) {
      tooltipTop = holeTop - 200;
      tooltipArrow = "bottom";
    }
    if (tooltipTop < 16) {
      tooltipTop = 16;
      tooltipArrow = null;
    }
  }

  return (
    <>
      {rect && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div
            className="absolute left-0 right-0 bg-black/75"
            style={{ top: 0, height: holeTop }}
          />
          <div
            className="absolute left-0 right-0 bg-black/75"
            style={{ top: holeBottom, bottom: 0 }}
          />
          <div
            className="absolute bg-black/75"
            style={{
              top: holeTop,
              left: 0,
              width: holeLeft,
              height: holeBottom - holeTop,
            }}
          />
          <div
            className="absolute bg-black/75"
            style={{
              top: holeTop,
              left: holeRight,
              right: 0,
              height: holeBottom - holeTop,
            }}
          />
        </div>
      )}

      {rect && (
        <div
          className="fixed z-50 rounded-2xl border-2 border-white/80 animate-pulse pointer-events-none"
          style={{
            left: holeLeft,
            top: holeTop,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }}
        />
      )}

      <div
        className="fixed z-50 w-[280px] bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-5 pointer-events-auto"
        style={{ left: tooltipLeft, top: tooltipTop }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Крок {currentStep + 1} з {STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-[10px] text-neutral-500 hover:text-white transition-colors uppercase tracking-wider"
          >
            Пропустити
          </button>
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
        <p className="text-[12px] text-neutral-400 leading-relaxed mb-4">
          {step.description}
        </p>
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="px-3 py-2 rounded-lg bg-neutral-800/60 text-white text-[11px] font-medium hover:bg-neutral-700/60 transition-all"
            >
              Назад
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-3 py-2 rounded-lg bg-white text-black text-[11px] font-semibold hover:bg-neutral-200 transition-all"
          >
            {currentStep === STEPS.length - 1 ? "Завершити" : "Далі"}
          </button>
        </div>
      </div>

      {rect && tooltipArrow === "top" && (
        <div
          className="fixed z-50 w-3 h-3 bg-[#1a1a1e] border-l border-t border-white/10 rotate-45"
          style={{
            left: rect.left + rect.width / 2 - 6,
            top: tooltipTop - 6,
          }}
        />
      )}
      {rect && tooltipArrow === "bottom" && (
        <div
          className="fixed z-50 w-3 h-3 bg-[#1a1a1e] border-r border-b border-white/10 rotate-45"
          style={{
            left: rect.left + rect.width / 2 - 6,
            top: tooltipTop + 196,
          }}
        />
      )}
    </>
  );
}
