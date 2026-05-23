"use client";

import { useEffect, useState, useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import Konva from "konva";
import { Stage, Layer, Text, Rect, Group, Image as KonvaImage } from "react-konva";
import { useEditorStore } from "@/store/editorStore";
import { splitText, calcAutoFitFontSize, measureTextWidth } from "@/utils/typographyUtils";
import { generateCollageGrid } from "@/utils/collageGenerator";
import { generateBarcodeSVG } from "@/utils/barcodeUtils";
import { formatDate } from "@/utils/exportUtils";
import { generatePrintPDF } from "@/utils/pdfPrintExport";
import { createPhotos } from "@/utils/photoUtils";
import PrintModal from "./PrintModal";

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

export interface CanvasPreviewRef {
  openPrintModal: () => void;
}

const CanvasPreview = forwardRef<CanvasPreviewRef, {}>((props, ref) => {
  const { typography, collage, decorations, updatePhoto, addPhotos } = useEditorStore();
  const [imgs, setImgs] = useState<Record<string, HTMLImageElement>>({});
  const [barcode, setBarcode] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [showDropOverlay, setShowDropOverlay] = useState(false);
  const dragCounterRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const loading = useRef<Set<string>>(new Set());
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printStatus, setPrintStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [printError, setPrintError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<string>("#f4f4f0");

  useImperativeHandle(ref, () => ({
    openPrintModal: () => {
      const stage = stageRef.current;
      if (stage) {
        const url = stage.toDataURL({ pixelRatio: 0.25, mimeType: "image/png" });
        setPreviewUrl(url);
      }
      setPreviewBg(isLightText ? "#171717" : "#f4f4f0");
      setShowPrintModal(true);
      setPrintStatus("idle");
    },
  }));

  useEffect(() => {
    document.fonts.ready.then(() => setFontLoaded(true));
  }, []);

  useEffect(() => {
    if (fontLoaded && stageRef.current) {
      const texts = stageRef.current.find("Text");
      texts.forEach((node: any) => {
        node.clearCache();
        node.fontFamily(node.fontFamily());
      });
      stageRef.current.batchDraw();
    }
  }, [fontLoaded]);

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
      const mw = Math.max(0, el.clientWidth - 40);
      const mh = Math.max(0, el.clientHeight - 40);
      if (mw <= 0 || mh <= 0) return;
      const sx = mw / FULL_W;
      const sy = mh / FULL_H;
      setScale(Math.min(sx, sy, 0.95));
      setCanvasReady(true);
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

  const handleSendToPrint = async (nick: string) => {
    const stage = stageRef.current;
    if (!stage) return;

    setPrintStatus("sending");

    const originalW = stage.width();
    const originalH = stage.height();
    const originalScaleX = stage.scaleX();
    const originalScaleY = stage.scaleY();

    stage.width(FULL_W);
    stage.height(FULL_H);
    stage.scale({ x: 1, y: 1 });
    stage.draw();

    const pdfDataURL = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });

    let pdfBytes: Uint8Array | null = null;
    try {
      pdfBytes = await generatePrintPDF(typography.color, pdfDataURL);
    } catch (e) {
      console.error("PDF generation failed", e);
      setPrintStatus("error");
      setPrintError("Помилка генерації PDF");
      stage.width(originalW);
      stage.height(originalH);
      stage.scale({ x: originalScaleX, y: originalScaleY });
      stage.draw();
      return;
    }

    stage.width(originalW);
    stage.height(originalH);
    stage.scale({ x: originalScaleX, y: originalScaleY });
    stage.draw();

    if (!pdfBytes) {
      setPrintStatus("error");
      setPrintError("PDF не згенеровано");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("instagramNick", nick);
      formData.append("pdf", new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" }), "printboom.pdf");

      const res = await fetch("/api/send-to-print", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setPrintStatus("success");
      } else {
        setPrintStatus("error");
        setPrintError(json.error || "Невідома помилка відправки");
      }
    } catch (err: any) {
      setPrintStatus("error");
      setPrintError(err?.message || "Мережева помилка");
    }
  };

  // Auto background based on text color
  const isLightText = isLightColor(typography.color);
  const canvasBg = isLightText ? "#171717" : "#f4f4f0";

  const handleDragEnter = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) setShowDropOverlay(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setShowDropOverlay(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setShowDropOverlay(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const maxNew = Math.max(0, 12 - collage.photos.length);
    const toAdd = files.slice(0, maxNew);
    const photos = await createPhotos(toAdd);
    if (photos.length > 0) addPhotos(photos);
  };

  return (
    <div
      ref={containerRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="w-full h-full relative overflow-hidden flex items-center justify-center select-none"
      style={{ backgroundColor: canvasBg }}
    >
      {showDropOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="text-white text-lg font-medium">Відпустіть, щоб завантажити фото</div>
          </div>
        </div>
      )}
      <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: "center center", opacity: canvasReady ? 1 : 0, transition: "opacity 0.15s ease" }} onContextMenu={(e) => e.preventDefault()}>
        <div className="absolute inset-0 z-10 bg-transparent pointer-events-none select-none" aria-hidden="true" />
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
                  <Group key={`typo-${i}-${fontLoaded}`} y={yy} x={textOffsetX}>
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
                  <Text x={0} y={collageH / 2 - 36} width={collageW} text="перетягніть 6–12 фото" fontSize={72} fontFamily="'Helvetica Neue', sans-serif" fill="#444" align="center" letterSpacing={4} listening={false} />
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
            {!decorations.noText && (
              <>
                {decorations.signatureEnabled && decorations.signature && (
                  <Text
                    key={`sig-${fontLoaded}`}
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
                    key={`date-${fontLoaded}`}
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
                  <Group key={`barcode-${fontLoaded}`} x={PAD_X} y={row2Y}>
                    <KonvaImage image={barcode} x={0} y={0} width={barcodeW} height={barcodeH} listening={false} />
                  </Group>
                )}
                {decorations.taglineEnabled && decorations.tagline && (
                  <Text
                    key={`tag-${fontLoaded}`}
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
              </>
            )}
          </Layer>
        </Stage>
      </div>

      {collage.photos.length > 0 && !ready && (
        <div className="absolute top-4 left-4 text-xs text-gray-400 animate-pulse">Завантаження...</div>
      )}

      {showPrintModal && (
        <PrintModal
          onClose={() => setShowPrintModal(false)}
          onSubmit={handleSendToPrint}
          status={printStatus}
          errorMsg={printError}
          previewUrl={previewUrl}
          previewBg={previewBg}
        />
      )}

      {/* Desktop actions — bottom right */}
      <div className="hidden md:block absolute bottom-5 right-5 z-20">
        <div className="flex flex-col gap-2">
          <div data-onboarding="undo" className="flex items-center gap-2 md:gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-2 md:px-2 md:py-1.5 border border-white/10 shadow-xl">
            <button
              onClick={() => useEditorStore.getState().undo()}
              className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all text-sm active:scale-90"
              title="Undo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button
              onClick={() => useEditorStore.getState().redo()}
              className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all text-sm active:scale-90"
              title="Redo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
            </button>
            <div className="w-px h-5 md:h-4 bg-white/15 mx-0.5" />
            <button
              onClick={() => useEditorStore.getState().reset()}
              className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full text-red-400/80 hover:text-red-300 hover:bg-red-500/15 transition-all text-sm active:scale-90"
              title="Reset all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CanvasPreview;
