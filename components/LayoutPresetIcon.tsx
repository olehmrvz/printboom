"use client";

import { LayoutPreset } from "@/types";

interface LayoutPresetIconProps {
  preset: LayoutPreset;
  className?: string;
}

export default function LayoutPresetIcon({ preset, className = "" }: LayoutPresetIconProps) {
  const fill = "currentColor";
  const gap = 1.5;

  switch (preset) {
    case "grid-4x3":
      return (
        <svg width="32" height="24" viewBox="0 0 32 24" className={className} fill="none">
          {/* 4 cols x 3 rows */}
          {Array.from({ length: 3 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={col * (7 + gap)}
                y={row * (6.5 + gap)}
                width={7}
                height={6.5}
                rx={1}
                fill={fill}
                opacity={0.25}
              />
            ))
          )}
        </svg>
      );

    case "grid":
      return (
        <svg width="32" height="24" viewBox="0 0 32 24" className={className} fill="none">
          {/* 3 cols x 4 rows */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={col * (9.5 + gap)}
                y={row * (4.5 + gap)}
                width={9.5}
                height={4.5}
                rx={1}
                fill={fill}
                opacity={0.25}
              />
            ))
          )}
        </svg>
      );

    case "column-2":
      return (
        <svg width="32" height="24" viewBox="0 0 32 24" className={className} fill="none">
          {/* 2 cols x 3 rows */}
          {Array.from({ length: 3 }).map((_, row) =>
            Array.from({ length: 2 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={col * (15 + gap)}
                y={row * (7 + gap)}
                width={15}
                height={7}
                rx={1}
                fill={fill}
                opacity={0.25}
              />
            ))
          )}
        </svg>
      );

    case "column-3":
      return (
        <svg width="32" height="24" viewBox="0 0 32 24" className={className} fill="none">
          {/* 3 cols x 4 rows */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={col * (9.5 + gap)}
                y={row * (4.5 + gap)}
                width={9.5}
                height={4.5}
                rx={1}
                fill={fill}
                opacity={0.25}
              />
            ))
          )}
        </svg>
      );

    case "hero":
      return (
        <svg width="32" height="24" viewBox="0 0 32 24" className={className} fill="none">
          {/* Hero top */}
          <rect x="0" y="0" width={32} height={10} rx={1} fill={fill} opacity={0.25} />
          {/* Bottom grid */}
          {Array.from({ length: 2 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={col * (9.5 + gap)}
                y={12 + row * (5.5 + gap)}
                width={9.5}
                height={5.5}
                rx={1}
                fill={fill}
                opacity={0.25}
              />
            ))
          )}
        </svg>
      );

    case "editorial":
      return (
        <svg width="32" height="24" viewBox="0 0 32 24" className={className} fill="none">
          {/* Asymmetric editorial */}
          <rect x="0" y="0" width={19} height={11} rx={1} fill={fill} opacity={0.25} />
          <rect x="21" y="0" width={11} height={5} rx={1} fill={fill} opacity={0.25} />
          <rect x="21" y="6.5" width={11} height={4.5} rx={1} fill={fill} opacity={0.25} />
          <rect x="0" y="13" width={10} height={11} rx={1} fill={fill} opacity={0.25} />
          <rect x="12" y="13" width={20} height={5} rx={1} fill={fill} opacity={0.25} />
          <rect x="12" y="19.5" width={20} height={4.5} rx={1} fill={fill} opacity={0.25} />
        </svg>
      );

    default:
      return null;
  }
}
