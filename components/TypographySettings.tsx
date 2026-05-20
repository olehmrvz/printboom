"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { TextTemplate } from "@/types";

type ColorPreset = "white" | "black" | "red-white" | "red-black";

const PRESETS: { key: ColorPreset; label: string; top: string; bottom: string }[] = [
  { key: "white", label: "Все біле", top: "#FFFFFF", bottom: "#FFFFFF" },
  { key: "black", label: "Все чорне", top: "#000000", bottom: "#000000" },
  { key: "red-white", label: "Червоний / Білий", top: "#FF0000", bottom: "#FFFFFF" },
  { key: "red-black", label: "Червоний / Чорний", top: "#FF0000", bottom: "#000000" },
];

const PRIMARY_TEMPLATES: TextTemplate[] = [
  "MY GIRLFRIEND",
  "MY BOYFRIEND",
  "ONLY YOU",
  "KOXAYOU",
];

const MORE_TEMPLATES: TextTemplate[] = [
  "MY WIFE",
  "MY HUSBAND",
  "MY GIRL",
  "MY BOY",
  "ZHINKIN LEV",
  "LEV",
];

function applyPreset(
  preset: ColorPreset,
  setTypography: (c: any) => void,
  setDecorations: (c: any) => void
) {
  const colors = PRESETS.find((p) => p.key === preset)!;
  setTypography({
    color: colors.top,
    outlineColor: colors.top,
    customColorEnabled: false,
  });
  setDecorations({
    bottomTextColor: colors.bottom,
    barcodeColor: colors.bottom,
  });
}

export default function TypographySettings() {
  const { typography, setTypography, setTextTemplate, setDecorations } = useEditorStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const isPrimaryActive = PRIMARY_TEMPLATES.includes(typography.template);
  const isMoreActive = MORE_TEMPLATES.includes(typography.template);

  return (
    <div className="space-y-5">
      <SectionHeader title="Типографія" icon="T" />

      {/* Primary templates — 2×2 grid */}
      <div data-onboarding="templates" className="grid grid-cols-2 gap-2 md:gap-1.5">
        {PRIMARY_TEMPLATES.map((t) => (
          <TemplateButton
            key={t}
            template={t}
            active={typography.template === t}
            onClick={() => setTextTemplate(t)}
          />
        ))}
      </div>

      {/* Custom button */}
      <TemplateButton
        template="CUSTOM"
        active={typography.template === "CUSTOM"}
        onClick={() => setTextTemplate("CUSTOM")}
        fullWidth
      />

      {/* Custom text input */}
      {typography.template === "CUSTOM" && (
        <div className="relative">
          <input
            type="text"
            value={typography.text}
            onChange={(e) => setTypography({ text: e.target.value.toUpperCase() })}
            placeholder="ВВЕДІТЬ ТЕКСТ"
            className="w-full bg-neutral-800/50 text-white text-sm px-4 py-3 rounded-xl outline-none border border-neutral-700/40 focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-neutral-600"
          />
        </div>
      )}

      {/* More templates dropdown */}
      <div className="border border-neutral-700/30 rounded-xl overflow-hidden">
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-[11px] transition-all duration-200 ${
            isMoreActive
              ? "bg-white/5 text-white font-medium"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30"
          }`}
        >
            <span>Більше шаблонів</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {moreOpen && (
          <div className="grid grid-cols-2 gap-1 p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            {MORE_TEMPLATES.map((t) => (
              <TemplateButton
                key={t}
                template={t}
                active={typography.template === t}
                onClick={() => setTextTemplate(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Color Presets */}
      <div data-onboarding="colors" className="space-y-2">
        <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
          Пресети кольорів
        </label>
        <div className="grid grid-cols-2 gap-2 md:gap-1.5">
          {PRESETS.map((p) => {
            const isActive =
              !typography.customColorEnabled &&
              typography.color === p.top &&
              typography.outlineColor === p.top;
            return (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key, setTypography, setDecorations)}
                className={`group flex items-center gap-2.5 md:gap-2 text-[11px] md:text-[10px] px-4 py-3 md:px-3 md:py-2.5 rounded-xl transition-all duration-200 border ${
                  isActive
                    ? "bg-white text-black font-semibold border-white shadow-lg shadow-white/10"
                    : "bg-neutral-800/40 text-neutral-400 border-neutral-700/30 hover:bg-neutral-800/70 hover:border-neutral-600/40"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 md:w-2.5 md:h-2.5 rounded-full border border-white/10 shrink-0"
                  style={{ backgroundColor: p.top }}
                />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom colors toggle */}
      <Toggle
        checked={typography.customColorEnabled}
        onChange={() => setTypography({ customColorEnabled: !typography.customColorEnabled })}
        label="Власні кольори та обведення"
      />

      {/* Custom color controls */}
      {typography.customColorEnabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex gap-3">
            <ColorInput
              label="Заливка"
              value={typography.color}
              onChange={(v) => setTypography({ color: v })}
            />
            <ColorInput
              label="Обведення"
              value={typography.outlineColor}
              onChange={(v) => setTypography({ outlineColor: v })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Товщина обведення
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {typography.outlineThickness}px
              </span>
            </div>
            <StyledRange
              min={9}
              max={20}
              value={typography.outlineThickness}
              onChange={(v) => setTypography({ outlineThickness: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateButton({
  template,
  active,
  onClick,
  fullWidth = false,
}: {
  template: TextTemplate;
  active: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative text-[13px] md:text-[11px] px-4 py-3.5 md:px-3 md:py-2.5 rounded-xl text-left transition-all duration-200 border active:scale-[0.98] ${
        fullWidth ? "w-full" : ""
      } ${
        active
          ? "bg-white text-black font-bold border-white shadow-lg shadow-white/10 scale-[1.02]"
          : "bg-neutral-800/40 text-neutral-400 border-neutral-700/30 hover:bg-neutral-800/70 hover:text-neutral-200 hover:border-neutral-600/40 hover:scale-[1.02]"
      }`}
    >
      <span className="relative z-10">{template.toLowerCase()}</span>
    </button>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-lg bg-neutral-800/60 border border-neutral-700/30 flex items-center justify-center text-[10px] font-bold text-neutral-400">
        {icon}
      </div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
        {title}
      </h3>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3.5 md:gap-3 cursor-pointer group py-1">
      <div
        className={`relative w-11 h-6 md:w-9 md:h-5 rounded-full transition-colors duration-200 shrink-0 ${
          checked ? "bg-white" : "bg-neutral-700/50 group-hover:bg-neutral-700"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 md:w-4 md:h-4 rounded-full bg-black shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5 md:translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-[13px] md:text-[11px] text-neutral-400 group-hover:text-neutral-300 transition-colors select-none">
        {label}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex-1">
      <label className="text-[11px] md:text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-2 md:mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 md:h-9 rounded-xl cursor-pointer bg-neutral-800/50 border border-neutral-700/40 p-1 appearance-none overflow-hidden"
        />
        <div
          className="absolute inset-1.5 rounded-lg pointer-events-none border border-white/5"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}

function StyledRange({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative h-7 md:h-5 flex items-center">
      <div className="absolute left-0 right-0 h-1.5 md:h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/80 rounded-full transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        className="absolute w-5 h-5 md:w-3.5 md:h-3.5 bg-white rounded-full shadow-md pointer-events-none transition-all duration-150"
        style={{ left: `calc(${pct}% - 10px)` }}
      />
    </div>
  );
}
