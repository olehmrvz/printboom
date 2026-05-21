"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore } from "@/store/editorStore";
import { createPhotos } from "@/utils/photoUtils";
import { LAYOUT_PRESETS, Photo } from "@/types";
import LayoutPresetIcon from "./LayoutPresetIcon";

export default function CollageSettings({ hideHeader = false }: { hideHeader?: boolean }) {
  const { collage, addPhotos, removePhoto, reorderPhotos, setCollage, setLayoutPreset } = useEditorStore();
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const photo = collage.photos.find((p) => p.id === event.active.id);
      if (photo) setActivePhoto(photo);
    },
    [collage.photos]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActivePhoto(null);
      if (over && active.id !== over.id) {
        const oldIndex = collage.photos.findIndex((p) => p.id === active.id);
        const newIndex = collage.photos.findIndex((p) => p.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderPhotos(oldIndex, newIndex);
        }
      }
    },
    [collage.photos, reorderPhotos]
  );

  return (
    <div className="space-y-5">
      {!hideHeader && <SectionHeader title="Фото" icon="P" />}

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={collage.photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 md:grid-cols-3 gap-2 md:gap-1.5">
                {collage.photos.map((photo, idx) => (
                  <SortablePhoto
                    key={photo.id}
                    photo={photo}
                    idx={idx}
                    onRemove={removePhoto}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activePhoto ? (
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-white/50 shadow-lg opacity-90">
                  <img src={activePhoto.src} alt="" className="w-full h-full object-cover" />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
              className={`group flex flex-col items-center gap-2 px-3 py-3 md:px-2.5 md:py-2.5 rounded-xl text-center transition-all duration-200 border active:scale-[0.98] ${
                collage.layoutPreset === lp.value
                  ? "bg-white text-black font-semibold border-white shadow-lg shadow-white/10 scale-[1.02]"
                  : "bg-neutral-800/40 text-neutral-400 border-neutral-700/30 hover:bg-neutral-800/70 hover:text-neutral-200 hover:border-neutral-600/40 hover:scale-[1.02]"
              }`}
            >
              <LayoutPresetIcon
                preset={lp.value}
                className={collage.layoutPreset === lp.value ? "text-black" : "text-neutral-400 group-hover:text-neutral-200"}
              />
              <span className="text-[11px] md:text-[10px]">{lp.label}</span>
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

function SortablePhoto({
  photo,
  idx,
  onRemove,
}: {
  photo: Photo;
  idx: number;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 border border-transparent ${
        isDragging ? "opacity-30 scale-95" : ""
      } hover:border-neutral-600/30 hover:shadow-lg`}
    >
      <img src={photo.src} alt={`${idx + 1}`} className="w-full h-full object-cover" draggable={false} />
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(photo.id);
        }}
        className="absolute top-1 right-1 w-7 h-7 md:w-5 md:h-5 bg-black/70 backdrop-blur-sm text-white text-sm md:text-[10px] rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-500/90 hover:scale-110"
      >
        ×
      </button>
      <div className="absolute bottom-0 left-0 text-[10px] md:text-[9px] bg-black/60 backdrop-blur-sm text-white/80 px-2 py-1 md:px-1.5 md:py-0.5 rounded-tr-lg font-mono">{idx + 1}</div>
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
