import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export type AccentColor = "slate" | "blue" | "emerald" | "indigo";

export interface AccentColorOption {
  id: AccentColor;
  label: string;
  bgClass: string;
  lightPrimary: string;
  darkPrimary: string;
  lightRing: string;
  darkRing: string;
}

export const ACCENT_COLORS: AccentColorOption[] = [
  {
    id: "slate",
    label: "Default (Slate)",
    bgClass: "bg-slate-950 dark:bg-slate-200",
    lightPrimary: "oklch(0.205 0 0)",
    darkPrimary: "oklch(0.922 0 0)",
    lightRing: "oklch(0.708 0 0)",
    darkRing: "oklch(0.556 0 0)",
  },
  {
    id: "blue",
    label: "Ocean Blue",
    bgClass: "bg-blue-600",
    lightPrimary: "oklch(0.55 0.22 260)",
    darkPrimary: "oklch(0.65 0.2 260)",
    lightRing: "oklch(0.65 0.2 260)",
    darkRing: "oklch(0.55 0.22 260)",
  },
  {
    id: "emerald",
    label: "Emerald Green",
    bgClass: "bg-emerald-600",
    lightPrimary: "oklch(0.55 0.18 155)",
    darkPrimary: "oklch(0.68 0.18 155)",
    lightRing: "oklch(0.68 0.18 155)",
    darkRing: "oklch(0.55 0.18 155)",
  },
  {
    id: "indigo",
    label: "Vibrant Indigo",
    bgClass: "bg-indigo-600",
    lightPrimary: "oklch(0.51 0.23 275)",
    darkPrimary: "oklch(0.63 0.22 275)",
    lightRing: "oklch(0.63 0.22 275)",
    darkRing: "oklch(0.51 0.23 275)",
  },
];

export function applyAccentColor(accentId: AccentColor, isDark: boolean) {
  if (typeof document === "undefined") return;
  const opt = ACCENT_COLORS.find((c) => c.id === accentId) || ACCENT_COLORS[0];
  const root = document.documentElement;

  if (opt.id === "slate") {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--ring");
  } else {
    const primary = isDark ? opt.darkPrimary : opt.lightPrimary;
    const ring = isDark ? opt.darkRing : opt.lightRing;
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--ring", ring);
  }
}

export function useAppearance() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [accent, setAccentState] = useState<AccentColor>("slate");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedAccent = (localStorage.getItem("stp_accent_color") as AccentColor) || "slate";
    setAccentState(savedAccent);
  }, []);

  const isDark = (resolvedTheme || theme) === "dark";

  useEffect(() => {
    if (!mounted) return;
    applyAccentColor(accent, isDark);
  }, [accent, isDark, mounted]);

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem("stp_accent_color", newAccent);
    applyAccentColor(newAccent, isDark);
  };

  const toggleDarkMode = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
  };

  return {
    isDark,
    theme: theme || "light",
    accent,
    setAccent,
    toggleDarkMode,
    mounted,
  };
}
