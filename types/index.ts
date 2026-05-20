export type TypographyStyle = "filled" | "outline" | "both";

export type Alignment = "left" | "center" | "right";

export type PhotoFilter = "none" | "bw" | "contrast" | "grain";

export type TextTemplate =
  | "MY WIFE"
  | "MY GIRL"
  | "MY BOY"
  | "ONLY YOU"
  | "MY HUSBAND"
  | "MY GIRLFRIEND"
  | "MY BOYFRIEND"
  | "KOXAYOU"
  | "ZHINKIN LEV"
  | "LEV"
  | "CUSTOM";

export type LayoutPreset =
  | "grid"
  | "grid-4x3"
  | "column-2"
  | "column-3"
  | "hero"
  | "editorial";

export interface Photo {
  id: string;
  src: string;
  file: File;
  filter: PhotoFilter;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface TypographyConfig {
  text: string;
  template: TextTemplate;
  style: TypographyStyle;
  fontSize: number;
  lineSpacing: number;
  color: string;
  outlineColor: string;
  outlineThickness: number;
  alignment: Alignment;
  fontFamily: string;
  customTextEnabled: boolean;
  customColorEnabled: boolean;
}

export interface CollageConfig {
  photos: Photo[];
  filter: PhotoFilter;
  allBw: boolean;
  columns: number;
  layoutPreset: LayoutPreset;
}

export interface DecorationsConfig {
  signature: string;
  signatureEnabled: boolean;
  date: string;
  dateAuto: boolean;
  dateEnabled: boolean;
  showBarcode: boolean;
  tagline: string;
  taglineEnabled: boolean;
  bottomTextColor: string;
  barcodeColor: string;
  bottomFontSize: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  scale: number;
  backgroundColor: string;
}

export interface EditorSnapshot {
  typography: TypographyConfig;
  collage: CollageConfig;
  decorations: DecorationsConfig;
  canvas: CanvasConfig;
}

export interface EditorState {
  typography: TypographyConfig;
  collage: CollageConfig;
  decorations: DecorationsConfig;
  canvas: CanvasConfig;
  history: EditorSnapshot[];
  historyIndex: number;
}

export const TEXT_TEMPLATES: TextTemplate[] = [
  "MY WIFE",
  "MY HUSBAND",
  "MY GIRLFRIEND",
  "MY BOYFRIEND",
  "MY GIRL",
  "MY BOY",
  "ONLY YOU",
  "KOXAYOU",
  "ZHINKIN LEV",
  "LEV",
  "CUSTOM",
];

export const LAYOUT_PRESETS: { value: LayoutPreset; label: string }[] = [
  { value: "grid-4x3", label: "4×3 Grid" },
  { value: "grid", label: "Classic Grid" },
  { value: "column-2", label: "2 Columns" },
  { value: "column-3", label: "3 Columns" },
  { value: "hero", label: "Hero Image" },
  { value: "editorial", label: "Editorial" },
];

export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  text: "KOXAYOU",
  template: "CUSTOM",
  style: "both",
  fontSize: 120,
  lineSpacing: 10,
  color: "#000000",
  outlineColor: "#000000",
  outlineThickness: 9,
  alignment: "center",
  fontFamily: "'Druk Wide Cyr', sans-serif",
  customTextEnabled: false,
  customColorEnabled: false,
};

export const DEFAULT_COLLAGE: CollageConfig = {
  photos: [],
  filter: "none",
  allBw: false,
  columns: 4,
  layoutPreset: "grid-4x3",
};

export const DEFAULT_DECORATIONS: DecorationsConfig = {
  signature: "",
  signatureEnabled: false,
  date: "",
  dateAuto: true,
  dateEnabled: true,
  showBarcode: true,
  tagline: "",
  taglineEnabled: false,
  bottomTextColor: "#000000",
  barcodeColor: "#000000",
  bottomFontSize: 110,
};

export const DEFAULT_CANVAS: CanvasConfig = {
  width: 3000,
  height: 4500,
  scale: 0.3,
  backgroundColor: "transparent",
};
