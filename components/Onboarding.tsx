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
    selector: '[data-onboarding="photos"]',
    title: "Загрузите фото",
    description: "Нажмите сюда или перетащите 6–12 фотографий для коллажа.",
    tab: "photos",
  },
  {
    selector: '[data-onboarding="templates"]',
    title: "Выберите текст",
    description: "Используйте готовые шаблоны или введите свой текст.",
    tab: "typography",
  },
  {
    selector: '[data-onboarding="colors"]',
    title: "Настройте цвета",
    description: "Выберите пресет или задайте свои цвета заливки и обводки.",
    tab: "typography",
  },
  {
    selector: '[data-onboarding="layout"]',
    title: "Раскладка коллажа",
    description: "Выберите подходящую сетку для размещения фотографий.",
    tab: "photos",
  },
  {
    selector: '[data-onboarding="decorations"]',
    title: "Добавьте декорации",
    description: "Подпись, дата, штрихкод и слоган внизу коллажа.",
    tab: "decorations",
  },
  {
    selector: '[data-onboarding="export"]',
    title: "Сохраните результат",
    description: "Экспортируйте в PNG (с upscaling ×2) или PDF для печати.",
  },
  {
    selector: '[data-onboarding="undo"]',
    title: "Отмена действий",
    description: "Используйте Undo / Redo или сбросьте всё кнопкой Reset.",
  },
];

export default function Onboarding({
  onTabChange,
}: {
  onTabChange?: (tab: OnboardingTab) => void;
}) {
  const { hasCompletedOnboarding, completeOnboarding } = useEditorStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setIsVisible(true);
    }
  }, [hasCompletedOnboarding]);

  const updateRect = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step) return;

    if (step.tab && onTabChange) {
      onTabChange(step.tab);
    }

    requestAnimationFrame(() => {
      const el = document.querySelector(step.selector);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    });
  }, [currentStep, onTabChange]);

  useEffect(() => {
    if (!isVisible) return;
    updateRect();

    const handleResize = () => updateRect();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
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

  // Tooltip positioning
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
      {/* Dark overlay with hole */}
      {rect && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* Top */}
          <div
            className="absolute left-0 right-0 bg-black/75"
            style={{ top: 0, height: holeTop }}
          />
          {/* Bottom */}
          <div
            className="absolute left-0 right-0 bg-black/75"
            style={{ top: holeBottom, bottom: 0 }}
          />
          {/* Left */}
          <div
            className="absolute bg-black/75"
            style={{
              top: holeTop,
              left: 0,
              width: holeLeft,
              height: holeBottom - holeTop,
            }}
          />
          {/* Right */}
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

      {/* Pulsing border around target */}
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

      {/* Tooltip */}
      <div
        className="fixed z-50 w-[280px] bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl p-5 pointer-events-auto"
        style={{ left: tooltipLeft, top: tooltipTop }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Шаг {currentStep + 1} из {STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-[10px] text-neutral-500 hover:text-white transition-colors uppercase tracking-wider"
          >
            Пропустить
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
            {currentStep === STEPS.length - 1 ? "Завершить" : "Далее"}
          </button>
        </div>
      </div>

      {/* Arrow */}
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
