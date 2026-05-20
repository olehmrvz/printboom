"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Konva from "konva";
import { Stage, Layer, Text, Rect, Group, Image as KonvaImage } from "react-konva";
import { useEditorStore } from "@/store/editorStore";
import { splitText, calcAutoFitFontSize, measureTextWidth } from "@/utils/typographyUtils";
import { generateCollageGrid } from "@/utils/collageGenerator";
import { generateBarcodeSVG } from "@/utils/barcodeUtils";
import { formatDate } from "@/utils/exportUtils";

const FULL_W = 3000;
const FULL_H = 4500;
const PAD_X = 100;
const PAD_TOP = 40;
const PAD_BOTTOM = 120;
const GAP_TYPO_COLLAGE = 20;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export default function CanvasPreview() {
  const { typography, collage, decorations, updatePhoto, undo, redo, reset } = useEditorStore();
  const [imgs, setImgs] = useState<Record<string, HTMLImageElement>>({});
  const [barcode, setBarcode] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loading = useRef<Set<string>>(new Set());
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    document.fonts.ready.then(() => setFontLoaded(true));
  }, []);

  useEffect(() => {
    let loaded = 0;
    const total = collage.photos.length;
    if (total === 0) {
      setReady(true);
      return;
    }
    for (const p of collage.photos) {
      if (!loading.current.has(p.id) && !imgs[p.id]) {
        loading.current.add(p.id);
        loadImg(p.src).then((img) => {
          loading.current.delete(p.id);
          loaded++;
          setImgs((prev) => ({ ...prev, [p.id]: img }));
          if (loaded === total) setReady(true);
        });
      }
    }
  }, [collage.photos]);

  useEffect(() => {
    if (!decorations.showBarcode) return setBarcode(null);
    const svg = generateBarcodeSVG(700, 90, decorations.barcodeColor);
    const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    const img = new window.Image();
    img.onload = () => setBarcode(img);
    img.src = url;
  }, [decorations.showBarcode, decorations.barcodeColor]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      const mw = el.clientWidth - 40;
      const mh = el.clientHeight - 40;
      const sx = mw / FULL_W;
      const sy = mh / FULL_H;
      setScale(Math.min(sx, sy, 0.95));
    }
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const collageW = FULL_W - PAD_X * 2;

  const autoFit = useMemo(
    () => calcAutoFitFontSize(typography.text, collageW, typography.fontFamily, 560, 480),
    [typography.text, collageW, typography.fontFamily, fontLoaded]
  );

  const fs = autoFit.fontSize;
  const ls = autoFit.letterSpacing;
  const os = Math.max(9, typography.outlineThickness);
  const lineOverlap = fs * 0.35;

  const lines = useMemo(() => splitText(typography.text), [typography.text]);
  const dateStr = useMemo(() => formatDate(), []);

  const typoHeight = fs + (lines.length - 1) * lineOverlap;
  const collageY = PAD_TOP + typoHeight + GAP_TYPO_COLLAGE;

  // Bottom strip layout
  const bottomFontSize = decorations.bottomFontSize;
  const rightColW = 1400;
  const rightColX = FULL_W - PAD_X - rightColW;

  // Smart tagline splitting: always wrap to 2 lines when text overflows right column
  const processedTagline = useMemo(() => {
    const raw = (decorations.tagline || "").toUpperCase();
    if (!raw) return raw;
    const words = raw.split(/\s+/);
    if (words.length <= 1) return raw;
    const fullWidth = measureTextWidth(raw, bottomFontSize, 0, typography.fontFamily);
    if (fullWidth <= rightColW) return raw;
    let bestSplit = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const line1 = words.slice(0, i).join(" ");
      const line2 = words.slice(i).join(" ");
      const w1 = measureTextWidth(line1, bottomFontSize, 0, typography.fontFamily);
      const w2 = measureTextWidth(line2, bottomFontSize, 0, typography.fontFamily);
      if (w1 <= rightColW && w2 <= rightColW) {
        const diff = Math.abs(w1 - w2);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestSplit = i;
        }
      }
    }
    return words.slice(0, bestSplit).join(" ") + "\n" + words.slice(bestSplit).join(" ");
  }, [decorations.tagline, bottomFontSize, typography.fontFamily, rightColW, fontLoaded]);

  const taglineLineCount = processedTagline.includes("\n") ? 2 : (processedTagline ? 1 : 0);
  const row2Height = bottomFontSize * (taglineLineCount <= 1 ? 1.5 : taglineLineCount);
  const bottomStripHeight = bottomFontSize + 20 + row2Height + 20;
  const bottomStripY = FULL_H - bottomStripHeight - 40;

  // Ensure collage doesn't overlap bottom strip
  const collageH = Math.max(200, bottomStripY - collageY - GAP_TYPO_COLLAGE);

  const grid = useMemo(
    () =>
      generateCollageGrid(
        { photos: collage.photos, columns: collage.columns, layoutPreset: collage.layoutPreset },
        collageW,
        collageH
      ),
    [collage.photos, collage.columns, collage.layoutPreset, collageW, collageH]
  );

  const row1Y = bottomStripY;
  const row2Y = bottomStripY + bottomFontSize + 20;

  const sigFont = bottomFontSize;
  const tagFont = bottomFontSize;
  const dateFont = bottomFontSize;

  const barcodeW = Math.min(700, collageW * 0.58);
  const barcodeH = row2Height;

  const handleExport = async () => {
    const EXPORT_W = 3500;
    const EXPORT_H = Math.round(FULL_H * (EXPORT_W / FULL_W));
    const stage = stageRef.current;
    if (!stage) return;

    const originalW = stage.width();
    const originalH = stage.height();
    const originalScaleX = stage.scaleX();
    const originalScaleY = stage.scaleY();

    stage.width(EXPORT_W);
    stage.height(EXPORT_H);
    stage.scale({ x: EXPORT_W / FULL_W, y: EXPORT_H / FULL_H });
    stage.draw();

    const dataURL = stage.toDataURL({ pixelRatio: 3, mimeType: "image/png" });

    stage.width(originalW);
    stage.height(originalH);
    stage.scale({ x: originalScaleX, y: originalScaleY });
    stage.draw();

    const link = document.createElement("a");
    link.download = `printboom-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto background based on text color
  const isLightText = isLightColor(typography.color);
  const previewBg = isLightText ? "#171717" : "#f4f4f0";

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: previewBg }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
        <Stage ref={stageRef} width={FULL_W} height={FULL_H}>
          <Layer>
            {/* LAYERED TYPOGRAPHY */}
            <Group y={PAD_TOP} x={PAD_X}>
              {lines.map((line, i) => {
                const yy = i * lineOverlap;
                const isFirst = i === 0;
                const textBlockW = measureTextWidth(line, fs, ls, typography.fontFamily);
                const textOffsetX = Math.max(0, (collageW - textBlockW) / 2);
                return (
                  <Group key={i} y={yy} x={textOffsetX}>
                    {!isFirst && (
                      <Text
                        text={line}
                        fontSize={fs}
                        fontFamily={typography.fontFamily}
                        letterSpacing={ls}
                        fill="transparent"
                        stroke={typography.outlineColor}
                        strokeWidth={os}
                        strokeScaleEnabled={false}
                        fontStyle="bold"
                        wrap="none"
                        listening={false}
                      />
                    )}
                    {isFirst && (
                      <Text
                        text={line}
                        fontSize={fs}
                        fontFamily={typography.fontFamily}
                        letterSpacing={ls}
                        fill={typography.color}
                        fontStyle="bold"
                        wrap="none"
                        listening={false}
                      />
                    )}
                  </Group>
                );
              })}
            </Group>

            {/* COLLAGE */}
            <Group x={PAD_X} y={collageY}>
              {collage.photos.length === 0 && (
                <>
                  <Rect width={collageW} height={collageH} stroke="#2a2a2a" strokeWidth={1} dash={[12, 8]} listening={false} />
                  <Text x={0} y={collageH / 2 - 36} width={collageW} text="drop 6–12 photos" fontSize={72} fontFamily="'Helvetica Neue', sans-serif" fill="#444" align="center" letterSpacing={4} listening={false} />
                </>
              )}
              {grid.map((cell) => {
                const photo = collage.photos[cell.photoIndex];
                if (!photo) return null;
                const img = imgs[photo.id];
                if (!img) return null;
                const sc = Math.max(cell.width / img.width, cell.height / img.height);
                const imgW = img.width * sc;
                const imgH = img.height * sc;
                const baseX = cell.width / 2 - imgW / 2;
                const baseY = cell.height / 2 - imgH / 2;
                const posX = baseX + (photo.offsetX || 0);
                const posY = baseY + (photo.offsetY || 0);
                const minX = Math.min(0, cell.width - imgW);
                const maxX = Math.max(0, cell.width - imgW);
                const minY = Math.min(0, cell.height - imgH);
                const maxY = Math.max(0, cell.height - imgH);
                return (
                  <Group key={photo.id} x={cell.x} y={cell.y} clipX={0} clipY={0} clipWidth={cell.width} clipHeight={cell.height}>
                    <KonvaImage
                      image={img}
                      x={posX}
                      y={posY}
                      width={imgW}
                      height={imgH}
                      draggable
                      onDragMove={(e: any) => {
                        const node = e.target;
                        node.x(Math.max(minX, Math.min(maxX, node.x())));
                        node.y(Math.max(minY, Math.min(maxY, node.y())));
                      }}
                      onDragEnd={(e: any) => {
                        const node = e.target;
                        updatePhoto(photo.id, {
                          offsetX: node.x() - baseX,
                          offsetY: node.y() - baseY,
                        });
                      }}
                      ref={(node) => {
                        if (node) {
                          if (collage.allBw) {
                            node.cache();
                          } else {
                            node.clearCache();
                          }
                        }
                      }}
                      filters={collage.allBw ? [Konva.Filters.Grayscale] : undefined}
                    />
                  </Group>
                );
              })}
            </Group>

            {/* BOTTOM STRIP */}
            {decorations.signatureEnabled && decorations.signature && (
              <Text
                text={decorations.signature.toUpperCase()}
                x={PAD_X}
                y={row1Y}
                fontSize={sigFont}
                fontFamily={typography.fontFamily}
                fill={decorations.bottomTextColor}
                fontStyle="bold"
                listening={false}
              />
            )}
            {decorations.dateEnabled && (
              <Text
                text={decorations.date || dateStr}
                x={rightColX}
                y={row1Y}
                fontSize={dateFont}
                fontFamily={typography.fontFamily}
                fill={decorations.bottomTextColor}
                width={rightColW}
                align="right"
                wrap="none"
                fontStyle="bold"
                listening={false}
              />
            )}

            {decorations.showBarcode && barcode && (
              <Group x={PAD_X} y={row2Y}>
                <KonvaImage image={barcode} x={0} y={0} width={barcodeW} height={barcodeH} listening={false} />
              </Group>
            )}
            {decorations.taglineEnabled && decorations.tagline && (
              <Text
                text={processedTagline}
                x={rightColX}
                y={row2Y}
                fontSize={tagFont}
                fontFamily={typography.fontFamily}
                fill={decorations.bottomTextColor}
                width={rightColW}
                align="right"
                wrap="none"
                fontStyle="bold"
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {collage.photos.length > 0 && !ready && (
        <div className="absolute top-4 left-4 text-xs text-gray-400 animate-pulse">Loading...</div>
      )}

      {/* Export button — top right */}
      <div data-onboarding="export" className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
        <button
          onClick={handleExport}
          className="px-3 py-2 md:px-4 md:py-2.5 bg-sky-600 text-white text-[10px] md:text-[11px] font-semibold rounded-lg hover:bg-sky-500 transition-all uppercase tracking-wider shadow-lg shadow-sky-900/30 hover:shadow-sky-900/50 active:scale-95 md:hover:-translate-y-0.5 whitespace-nowrap"
        >
          PNG
        </button>
      </div>

      {/* Undo / Redo / Reset — bottom center */}
      <div data-onboarding="undo" className="absolute bottom-3 left-1/2 -translate-x-1/2 md:bottom-5 flex items-center gap-2 md:gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-2 md:px-2 md:py-1.5 z-20 border border-white/10 shadow-xl">
        <button
          onClick={undo}
          className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all text-sm active:scale-90"
          title="Undo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button
          onClick={redo}
          className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all text-sm active:scale-90"
          title="Redo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
        </button>
        <div className="w-px h-5 md:h-4 bg-white/15 mx-0.5" />
        <button
          onClick={reset}
          className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full text-red-400/80 hover:text-red-300 hover:bg-red-500/15 transition-all text-sm active:scale-90"
          title="Reset all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  );
}
