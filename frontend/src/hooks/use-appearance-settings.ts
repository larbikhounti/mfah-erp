import { useState, useEffect } from "react";

export type ColorTheme = "blue" | "zinc" | "rose" | "green" | "orange" | "violet";
export type FontSize = "sm" | "md" | "lg";

export const COLOR_THEME_KEY = "ui_color_theme";
export const FONT_SIZE_KEY = "ui_font_size";

export const DEFAULT_COLOR_THEME: ColorTheme = "blue";
export const DEFAULT_FONT_SIZE: FontSize = "md";

export const COLOR_THEME_OPTIONS: { value: ColorTheme; label: string; swatch: string }[] = [
  { value: "blue", label: "Blue", swatch: "oklch(0.6515 0.191972 251.4696)" },
  { value: "zinc", label: "Zinc", swatch: "oklch(0.205 0 0)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.645 0.246 16.44)" },
  { value: "green", label: "Green", swatch: "oklch(0.6 0.16 145)" },
  { value: "orange", label: "Orange", swatch: "oklch(0.705 0.19 45)" },
  { value: "violet", label: "Violet", swatch: "oklch(0.606 0.25 293)" },
];

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

function applyColorTheme(theme: ColorTheme) {
  document.documentElement.setAttribute("data-color-theme", theme);
}

function applyFontSize(size: FontSize) {
  document.documentElement.setAttribute("data-font-size", size);
}

// Reads the persisted appearance settings and exposes setters that update
// localStorage, the `<html>` attributes globals.css keys its overrides off
// of, and this hook's own state (so any component using the hook re-renders
// immediately, e.g. the settings page's own controls).
export function useAppearanceSettings() {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(DEFAULT_COLOR_THEME);
  const [fontSize, setFontSizeState] = useState<FontSize>(DEFAULT_FONT_SIZE);

  useEffect(() => {
    try {
      const storedColor = localStorage.getItem(COLOR_THEME_KEY) as ColorTheme | null;
      const storedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null;
      if (storedColor) setColorThemeState(storedColor);
      if (storedFontSize) setFontSizeState(storedFontSize);
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to defaults.
    }
  }, []);

  const setColorTheme = (theme: ColorTheme) => {
    try {
      localStorage.setItem(COLOR_THEME_KEY, theme);
    } catch {
      // Ignore — the attribute still gets applied for this session.
    }
    applyColorTheme(theme);
    setColorThemeState(theme);
  };

  const setFontSize = (size: FontSize) => {
    try {
      localStorage.setItem(FONT_SIZE_KEY, size);
    } catch {
      // Ignore — the attribute still gets applied for this session.
    }
    applyFontSize(size);
    setFontSizeState(size);
  };

  return { colorTheme, fontSize, setColorTheme, setFontSize };
}
