export async function exportToPNG(
  stage: any | null,
  scale: number = 1
): Promise<void> {
  if (!stage) return;

  const originalScale = stage.scaleX();
  stage.scale({ x: scale, y: scale });
  stage.draw();

  const dataURL = stage.toDataURL({
    pixelRatio: 1,
    mimeType: "image/png",
  });

  stage.scale({ x: originalScale, y: originalScale });
  stage.draw();

  const link = document.createElement("a");
  link.download = `printboom-export-${Date.now()}.png`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function calculateExportDimensions(
  baseWidth: number,
  targetWidth: number = 3500
): { width: number; height: number; scale: number } {
  const scale = targetWidth / baseWidth;
  return {
    width: targetWidth,
    height: Math.round(baseWidth * 1.4 * scale),
    scale,
  };
}

export function formatDate(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}.${m}.${y}`;
}
