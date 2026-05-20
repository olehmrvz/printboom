"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { formatDate } from "@/utils/exportUtils";

export default function DecorationsSettings() {
  const { decorations, setDecorations } = useEditorStore();

  useEffect(() => {
    if (decorations.dateEnabled && !decorations.date) {
      setDecorations({ date: formatDate() });
    }
  }, []);

  return (
    <div className="space-y-5">
      <SectionHeader title="Декорації" icon="D" />

      <div data-onboarding="decorations" className="space-y-4">
        {/* Signature */}
        <div className="space-y-2">
          <Toggle
            checked={decorations.signatureEnabled}
            onChange={() => setDecorations({ signatureEnabled: !decorations.signatureEnabled })}
              label="Підпис"
          />
          {decorations.signatureEnabled && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <input
                type="text"
                value={decorations.signature}
                onChange={(e) => setDecorations({ signature: e.target.value })}
                placeholder="Ваше ім'я"
                className="w-full bg-neutral-800/50 text-white text-base md:text-sm px-4 py-3.5 md:py-3 rounded-xl outline-none border border-neutral-700/40 focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-neutral-600"
              />
            </div>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Toggle
            checked={decorations.dateEnabled}
            onChange={() => setDecorations({ dateEnabled: !decorations.dateEnabled })}
              label="Дата"
          />
          {decorations.dateEnabled && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <input
                type="text"
                value={decorations.date}
                onChange={(e) => setDecorations({ date: e.target.value })}
                placeholder="ДД.ММ.РРРР"
                className="w-full bg-neutral-800/50 text-white text-base md:text-sm px-4 py-3.5 md:py-3 rounded-xl outline-none border border-neutral-700/40 focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-neutral-600"
              />
            </div>
          )}
        </div>

        {/* Barcode */}
        <Toggle
          checked={decorations.showBarcode}
          onChange={() => setDecorations({ showBarcode: !decorations.showBarcode })}
          label="Штрихкод"
        />

        {/* Tagline */}
        <div className="space-y-2">
          <Toggle
            checked={decorations.taglineEnabled}
            onChange={() => setDecorations({ taglineEnabled: !decorations.taglineEnabled })}
              label="Слоган"
          />
          {decorations.taglineEnabled && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <input
                type="text"
                value={decorations.tagline}
                onChange={(e) => setDecorations({ tagline: e.target.value })}
                placeholder="назавжди твоя"
                className="w-full bg-neutral-800/50 text-white text-base md:text-sm px-4 py-3.5 md:py-3 rounded-xl outline-none border border-neutral-700/40 focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-neutral-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom font size */}
      <div className="space-y-3 md:space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] md:text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
            Розмір шрифту знизу
          </label>
          <span className="text-[11px] md:text-[10px] text-neutral-400 font-mono">{decorations.bottomFontSize}px</span>
        </div>
        <StyledRange
          min={110}
          max={164}
          value={decorations.bottomFontSize}
          onChange={(v) => setDecorations({ bottomFontSize: v })}
        />
      </div>

      {/* Bottom & Barcode Color */}
      <div className="space-y-3 md:space-y-2">
        <label className="text-[11px] md:text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
          Колір низу та штрихкоду
        </label>
        <div className="relative">
          <input
            type="color"
            value={decorations.bottomTextColor}
            onChange={(e) =>
              setDecorations({ bottomTextColor: e.target.value, barcodeColor: e.target.value })
            }
            className="w-full h-9 rounded-xl cursor-pointer bg-neutral-800/50 border border-neutral-700/40 p-1 appearance-none overflow-hidden"
          />
          <div
            className="absolute inset-1.5 rounded-lg pointer-events-none border border-white/5"
            style={{ backgroundColor: decorations.bottomTextColor }}
          />
        </div>
      </div>
    </div>
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
