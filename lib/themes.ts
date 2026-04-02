import type { CSSProperties } from "react";

export const CUSTOM_THEME_ID = "custom_background_image";

export type ThemeBackground = Pick<
  CSSProperties,
  | "backgroundImage"
  | "backgroundColor"
  | "backgroundBlendMode"
  | "backgroundSize"
  | "backgroundPosition"
  | "backgroundRepeat"
>;

export type ThemeDefinition = {
  id: string;
  name: string;
  background: ThemeBackground;
};

export const BUILTIN_THEMES: ThemeDefinition[] = [
  {
    id: "gradient_blue_purple",
    name: "Blue Purple",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #2563eb 0%, #7c3aed 55%, #111827 100%)",
    },
  },
  {
    id: "gradient_neon_green",
    name: "Neon Green",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #22c55e 0%, #06b6d4 45%, #1f2937 100%)",
    },
  },
  {
    id: "gradient_sunset",
    name: "Sunset",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #0b1220 0%, #7c3aed 35%, #f97316 100%)",
    },
  },
  {
    id: "gradient_ocean",
    name: "Ocean",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #0ea5e9 0%, #065f46 60%, #0b1220 100%)",
    },
  },
  {
    id: "gradient_aurora",
    name: "Aurora",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #34d399 0%, #60a5fa 35%, #a78bfa 70%, #0b1220 100%)",
    },
  },
  {
    id: "gradient_rose_gold",
    name: "Rose Gold",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #fb7185 0%, #f59e0b 50%, #111827 100%)",
    },
  },
  {
    id: "gradient_lavender",
    name: "Lavender",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #c4b5fd 0%, #7dd3fc 55%, #0b1220 100%)",
    },
  },
  {
    id: "gradient_skyline",
    name: "Skyline",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 35%, #1d4ed8 70%, #111827 100%)",
    },
  },
  {
    id: "gradient_forest",
    name: "Forest",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #14532d 0%, #22c55e 45%, #0b1220 100%)",
    },
  },
  {
    id: "gradient_neon_purple",
    name: "Neon Purple",
    background: {
      backgroundImage:
        "linear-gradient(135deg, #a855f7 0%, #22d3ee 45%, #1f2937 100%)",
    },
  },
  {
    id: "solid_charcoal",
    name: "Charcoal",
    background: {
      backgroundColor: "#0b1220",
    },
  },
  {
    id: "solid_cream",
    name: "Cream",
    background: {
      backgroundColor: "#f8fafc",
    },
  },
  {
    id: "solid_coral",
    name: "Coral",
    background: {
      backgroundColor: "#fb7185",
    },
  },
  {
    id: "solid_mint",
    name: "Mint",
    background: {
      backgroundColor: "#10b981",
    },
  },
  {
    id: "grid_light",
    name: "Grid Light",
    background: {
      backgroundImage:
        "linear-gradient(180deg, rgba(2,6,23,0.15), rgba(2,6,23,0.55)), repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(to bottom, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 24px)",
      backgroundSize: "auto",
      backgroundPosition: "center",
      backgroundRepeat: "repeat",
    },
  },
  {
    id: "grid_dark_blue",
    name: "Grid Blue",
    background: {
      backgroundImage:
        "linear-gradient(180deg, rgba(2,6,23,0.85), rgba(2,6,23,0.95)), repeating-linear-gradient(to right, rgba(56,189,248,0.20) 0, rgba(56,189,248,0.20) 1px, transparent 1px, transparent 26px), repeating-linear-gradient(to bottom, rgba(56,189,248,0.20) 0, rgba(56,189,248,0.20) 1px, transparent 1px, transparent 26px)",
      backgroundPosition: "center",
      backgroundRepeat: "repeat",
    },
  },
  {
    id: "grid_ember",
    name: "Grid Ember",
    background: {
      backgroundImage:
        "linear-gradient(180deg, rgba(2,6,23,0.85), rgba(2,6,23,0.98)), repeating-linear-gradient(to right, rgba(251,113,133,0.22) 0, rgba(251,113,133,0.22) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(to bottom, rgba(251,113,133,0.22) 0, rgba(251,113,133,0.22) 1px, transparent 1px, transparent 22px)",
      backgroundPosition: "center",
      backgroundRepeat: "repeat",
    },
  },
  {
    id: "pattern_dots",
    name: "Dots",
    background: {
      backgroundColor: "#0b1220",
      backgroundImage:
        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 1px)",
      backgroundSize: "18px 18px",
    },
  },
  {
    id: "pattern_hatch",
    name: "Hatch",
    background: {
      backgroundImage:
        "linear-gradient(135deg, rgba(255,255,255,0.10) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.10) 25%, transparent 25%), linear-gradient(45deg, rgba(56,189,248,0.10) 25%, transparent 25%), linear-gradient(315deg, rgba(168,85,247,0.10) 25%, transparent 25%)",
      backgroundSize: "18px 18px",
      backgroundPosition: "0 0, 0 9px, 9px -9px, -9px 0",
      backgroundRepeat: "repeat",
    },
  },
  {
    id: "pattern_glow_stripes",
    name: "Glow Stripes",
    background: {
      backgroundImage:
        "linear-gradient(90deg, rgba(34,211,238,0.10) 0%, rgba(34,211,238,0) 20%, rgba(168,85,247,0.12) 50%, rgba(168,85,247,0) 80%), linear-gradient(135deg, #0b1220 0%, #1f2937 100%)",
      backgroundBlendMode: "screen",
    },
  },
];

export function getThemeBackgroundStyle(
  selectedThemeId: string,
  customBackgroundDataUrl?: string
): ThemeBackground {
  if (selectedThemeId === CUSTOM_THEME_ID && customBackgroundDataUrl) {
    return {
      backgroundImage: `url(${customBackgroundDataUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  return (
    BUILTIN_THEMES.find((t) => t.id === selectedThemeId)?.background ?? {
      backgroundImage:
        "linear-gradient(135deg, #0b1220 0%, #7c3aed 35%, #f97316 100%)",
    }
  );
}

