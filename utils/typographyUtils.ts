export function splitText(text: string, _maxLines: number = 3): string[] {
  const t = text.trim().toUpperCase();
  if (!t) return ["", "", ""];
  return [t, t, t];
}

export interface AutoFitResult {
  fontSize: number;
  letterSpacing: number;
}

export function calcAutoFitFontSize(
  text: string,
  targetWidth: number,
  fontFamily: string,
  maxFontSize: number = 560,
  fontSizeCap?: number
): AutoFitResult {
  const line = text.trim().toUpperCase();
  if (!line) return { fontSize: 80, letterSpacing: 0 };

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const target = targetWidth * 0.98;

  // Dynamic cap: short texts can be larger
  const dynamicCap = fontSizeCap ?? (line.length < 5 ? 720 : line.length < 8 ? 560 : 480);

  // Binary search for font size
  let lo = 40;
  let hi = maxFontSize;
  let best = lo;

  for (let iter = 0; iter < 30; iter++) {
    const mid = Math.round((lo + hi) / 2);
    ctx.font = `bold ${mid}px ${fontFamily}`;
    const w = ctx.measureText(line).width;
    if (w <= target) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  // Cap font size and use letter spacing to fill width
  let fontSize = best;
  let letterSpacing = 0;

  if (fontSize > dynamicCap && line.length > 1) {
    fontSize = dynamicCap;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const naturalWidth = ctx.measureText(line).width;
    const gap = target - naturalWidth;
    if (gap > 0) {
      letterSpacing = gap / line.length;
    }
  }

  return { fontSize, letterSpacing };
}

export function measureTextWidth(
  text: string,
  fontSize: number,
  letterSpacing: number,
  fontFamily: string
): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  // Konva adds letterSpacing after each character
  return metrics.width + letterSpacing * text.length;
}
