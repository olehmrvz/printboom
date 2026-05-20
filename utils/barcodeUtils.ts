export function generateBarcodeSVG(width: number = 200, height: number = 60, color: string = "#000"): string {
  const bars: string[] = [];
  const patterns = [
    "1,1,1,0,0,1,0", "0,0,1,0,1,1,0", "1,1,0,0,1,1,0",
    "0,0,0,1,1,1,0", "1,0,0,1,0,1,0", "0,1,0,1,0,1,0",
  ];

  let x = 0;
  for (let i = 0; i < 40; i++) {
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const segments = pattern.split(",");
    for (const s of segments) {
      const bw = s === "1";
      const barWidth = bw ? 3.5 + Math.random() * 3 : 3 + Math.random() * 2.5;
      if (bw) {
        bars.push(`<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="${color}" />`);
      }
      x += barWidth;
    }
  }

  return `<svg width="${x}" height="${height}" viewBox="0 0 ${x} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${bars.join("\n    ")}
  </svg>`;
}

export function barcodeToDataURL(svgString: string): string {
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
}
