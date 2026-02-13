import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  init: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "system",
  resolvedTheme: "light",

  init: () => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("theme") as Theme | null;
    const theme = stored || "system";
    const resolved = resolveTheme(theme);

    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      if (get().theme === "system") {
        const resolved = resolveTheme("system");
        applyTheme(resolved);
        set({ resolvedTheme: resolved });
      }
    });
  },

  setTheme: (theme) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("theme", theme);
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },
}));

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

function applyTheme(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}
