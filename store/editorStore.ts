import { create } from "zustand";
import {
  TypographyConfig,
  CollageConfig,
  DecorationsConfig,
  CanvasConfig,
  EditorSnapshot,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_COLLAGE,
  DEFAULT_DECORATIONS,
  DEFAULT_CANVAS,
  Photo,
  TypographyStyle,
  Alignment,
  TextTemplate,
  LayoutPreset,
} from "@/types";

function snap(s: any): EditorSnapshot {
  return {
    typography: { ...s.typography },
    collage: { ...s.collage, photos: s.collage.photos.map((p: Photo) => ({ ...p })) },
    decorations: { ...s.decorations },
    canvas: { ...s.canvas },
  };
}

function push(s: any) {
  const entry = snap(s);
  const history = s.history.slice(0, s.historyIndex + 1);
  history.push(entry);
  if (history.length > 50) history.shift();
  return { history, historyIndex: history.length - 1 };
}

const getInitialOnboarding = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("printboom-onboarding") === "true";
};

interface EditorStore {
  typography: TypographyConfig;
  collage: CollageConfig;
  decorations: DecorationsConfig;
  canvas: CanvasConfig;
  history: EditorSnapshot[];
  historyIndex: number;
  hasCompletedOnboarding: boolean;

  setTypography: (config: Partial<TypographyConfig>) => void;
  setCollage: (config: Partial<CollageConfig>) => void;
  setDecorations: (config: Partial<DecorationsConfig>) => void;
  setCanvas: (config: Partial<CanvasConfig>) => void;

  addPhotos: (photos: Photo[]) => void;
  removePhoto: (id: string) => void;
  reorderPhotos: (from: number, to: number) => void;
  updatePhoto: (id: string, updates: Partial<Photo>) => void;

  setTextTemplate: (template: TextTemplate) => void;
  setBottomTemplate: (signature: string, tagline: string) => void;
  setTypographyStyle: (style: TypographyStyle) => void;
  setAlignment: (alignment: Alignment) => void;
  setLayoutPreset: (preset: LayoutPreset) => void;

  undo: () => void;
  redo: () => void;
  reset: () => void;
  completeOnboarding: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  typography: { ...DEFAULT_TYPOGRAPHY },
  collage: { ...DEFAULT_COLLAGE },
  decorations: { ...DEFAULT_DECORATIONS },
  canvas: { ...DEFAULT_CANVAS },
  history: [],
  historyIndex: -1,
  hasCompletedOnboarding: getInitialOnboarding(),

  setTypography: (config) =>
    set((s) => {
      const typography = { ...s.typography, ...config };
      return { typography, ...push({ ...s, typography }) };
    }),

  setCollage: (config) =>
    set((s) => {
      const collage = { ...s.collage, ...config };
      return { collage, ...push({ ...s, collage }) };
    }),

  setDecorations: (config) =>
    set((s) => {
      const decorations = { ...s.decorations, ...config };
      return { decorations, ...push({ ...s, decorations }) };
    }),

  setCanvas: (config) =>
    set((s) => ({ canvas: { ...s.canvas, ...config } })),

  addPhotos: (photos) =>
    set((s) => {
      const collage = { ...s.collage, photos: [...s.collage.photos, ...photos] };
      return { collage, ...push({ ...s, collage }) };
    }),

  removePhoto: (id) =>
    set((s) => {
      const collage = { ...s.collage, photos: s.collage.photos.filter((p) => p.id !== id) };
      return { collage, ...push({ ...s, collage }) };
    }),

  reorderPhotos: (from, to) =>
    set((s) => {
      const photos = [...s.collage.photos];
      const [moved] = photos.splice(from, 1);
      photos.splice(to, 0, moved);
      const collage = { ...s.collage, photos };
      return { collage, ...push({ ...s, collage }) };
    }),

  updatePhoto: (id, updates) =>
    set((s) => {
      const collage = {
        ...s.collage,
        photos: s.collage.photos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      };
      return { collage, ...push({ ...s, collage }) };
    }),

  setTextTemplate: (template) =>
    set((s) => {
      const map: Record<string, string> = {
        "MY WIFE": "MY WIFE",
        "MY GIRL": "MY GIRL",
        "MY BOY": "MY BOY",
        "ONLY YOU": "ONLY YOU",
        "MY HUSBAND": "MY HUSBAND",
        "MY GIRLFRIEND": "MY GIRLFRIEND",
        "MY BOYFRIEND": "MY BOYFRIEND",
        "KOXAYOU": "KOXAYOU",
        "ZHINKIN LEV": "ZHINKIN LEV",
        "LEV": "LEV",
      };
      const text = map[template] || s.typography.text;
      const typography = { ...s.typography, template, text, customTextEnabled: false };
      return { typography, ...push({ ...s, typography }) };
    }),

  setBottomTemplate: (signature: string, tagline: string) =>
    set((s) => {
      const decorations = {
        ...s.decorations,
        signature,
        signatureEnabled: true,
        tagline,
        taglineEnabled: true,
      };
      return { decorations, ...push({ ...s, decorations }) };
    }),

  setTypographyStyle: (style) =>
    set((s) => {
      const typography = { ...s.typography, style };
      return { typography, ...push({ ...s, typography }) };
    }),

  setAlignment: (alignment) =>
    set((s) => {
      const typography = { ...s.typography, alignment };
      return { typography, ...push({ ...s, typography }) };
    }),

  setLayoutPreset: (preset) =>
    set((s) => {
      const collage = { ...s.collage, layoutPreset: preset };
      return { collage, ...push({ ...s, collage }) };
    }),

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < 0) return;
    const s = history[historyIndex];
    set({
      typography: { ...s.typography },
      collage: { ...s.collage, photos: s.collage.photos.map((p) => ({ ...p })) },
      decorations: { ...s.decorations },
      canvas: { ...s.canvas },
      historyIndex: historyIndex - 1,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 2) return;
    const s = history[historyIndex + 2];
    if (!s) return;
    set({
      typography: { ...s.typography },
      collage: { ...s.collage, photos: s.collage.photos.map((p) => ({ ...p })) },
      decorations: { ...s.decorations },
      canvas: { ...s.canvas },
      historyIndex: historyIndex + 1,
    });
  },

  reset: () =>
    set({
      typography: { ...DEFAULT_TYPOGRAPHY },
      collage: { ...DEFAULT_COLLAGE },
      decorations: { ...DEFAULT_DECORATIONS },
      canvas: { ...DEFAULT_CANVAS },
      history: [],
      historyIndex: -1,
    }),

  completeOnboarding: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("printboom-onboarding", "true");
    }
    set({ hasCompletedOnboarding: true });
  },
}));
