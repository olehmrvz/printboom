# Printboom — Project Info

## Development
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Lint check

## Architecture
- Next.js 16 with App Router
- State: Zustand (single store)
- Canvas: react-konva (Konva.js)
- Styles: TailwindCSS v4
- Types: TypeScript strict

## Key Files
- `store/editorStore.ts` — Global state
- `components/CanvasPreview.tsx` — Konva canvas renderer
- `components/EditorLayout.tsx` — Main layout
- `utils/collageGenerator.ts` — Collage grid algorithm
- `utils/typographyUtils.ts` — Text auto-fit logic
- `utils/exportUtils.ts` — PNG export
- `types/index.ts` — All type definitions

## Export
- PNG at 3500px wide
- 300 DPI equivalent
- Transparent background
- 3000x4000 canvas
