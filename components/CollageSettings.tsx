"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { createPhotos } from "@/utils/photoUtils";
import { LAYOUT_PRESETS } from "@/types";

export default function CollageSettings() {
  const { collage, addPhotos, removePhoto, reorderPhotos, setCollage, setLayoutPreset } = useEditorStore();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const onDrop = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      const maxNew = Math.max(0, 12 - collage.photos.length);
      const toAdd = files.slice(0, maxNew);
      const photos = await createPhotos(toAdd);
      if (photos.length > 0) addPhotos(photos);
      e.target.value = "";
    },
    [addPhotos, collage.photos.length]
  );

  return (
    <div className="space-y-5">
      <SectionHeader title="Фото" icon="P" />

      <label data-onboarding="photos" className="group flex items-center justify-center w-full h-24 md:h-20 border-2 border-dashed border-neutral-700/40 rounded-2xl cursor-pointer hover:border-neutral-500/60 transition-all duration-300 bg-neutral-800/20 hover:bg-neutral-800/40 active:bg-neutral-800/60">
        <div className="text-center">
          <div className="w-10 h-10 md:w-8 md:h-8 mx-auto mb-1.5 md:mb-1 rounded-full bg-neutral-800/60 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-neutral-700/60 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div className="text-[11px] md:text-[10px] text-neutral-500 font-medium">Перетягніть 6–12 фото</div>
        </div>
        <input type="file" multiple accept="image/*" onChange={onDrop} className="hidden" />
      </label>

      {collage.photos.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-600 font-medium">Перетягніть, щоб змінити порядок</p>
            <span className="text-[10px] text-neutral-600 font-mono">{collage.photos.length}/12</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-3 gap-2 md:gap-1.5">
            {collage.photos.map((photo, idx) => (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => {
                  setDragIdx(idx);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragIdx !== null && dragIdx !== idx) setDropTarget(idx);
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIdx !== null && dragIdx !== idx) reorderPhotos(dragIdx, idx);
                  setDragIdx(null);
                  setDropTarget(null);
                }}
                onDragEnd={() => {
                  setDragIdx(null);
                  setDropTarget(null);
                }}
                className={`relative group aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 border border-transparent ${
                  dragIdx === idx ? "opacity-30 scale-95" : ""
                } ${dropTarget === idx ? "ring-2 ring-white/50 scale-105 z-10 border-white/20" : "hover:border-neutral-600/30 hover:shadow-lg"}`}
              >
                <img src={photo.src} alt={`${idx + 1}`} className="w-full h-full object-cover" draggable={false} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(photo.id);
                  }}
                  className="absolute top-1 right-1 w-7 h-7 md:w-5 md:h-5 bg-black/70 backdrop-blur-sm text-white text-sm md:text-[10px] rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-500/90 hover:scale-110"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 text-[10px] md:text-[9px] bg-black/60 backdrop-blur-sm text-white/80 px-2 py-1 md:px-1.5 md:py-0.5 rounded-tr-lg font-mono">{idx + 1}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Layout Presets */}
      <div data-onboarding="layout" className="space-y-2">
        <label className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
          Layout
        </label>
        <div className="grid grid-cols-2 gap-2 md:gap-1.5">
          {LAYOUT_PRESETS.map((lp) => (
            <button
              key={lp.value}
              onClick={() => setLayoutPreset(lp.value)}
              className={`group text-[12px] md:text-[10px] px-4 py-3.5 md:px-3 md:py-2.5 rounded-xl text-left transition-all duration-200 border active:scale-[0.98] ${
                collage.layoutPreset === lp.value
                  ? "bg-white text-black font-semibold border-white shadow-lg shadow-white/10 scale-[1.02]"
                  : "bg-neutral-800/40 text-neutral-400 border-neutral-700/30 hover:bg-neutral-800/70 hover:text-neutral-200 hover:border-neutral-600/40 hover:scale-[1.02]"
              }`}
            >
              {lp.label}
            </button>
          ))}
        </div>
      </div>

      <Toggle
        checked={collage.allBw}
        onChange={() => setCollage({ allBw: !collage.allBw })}
        label="Все чорно-біле"
      />
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
