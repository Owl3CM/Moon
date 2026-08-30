import { Theme, Color } from "../Moon.Types";

let dynamicColors: { [key in Color]?: string } = {};

// NOTE: Duplicated in builder/utils.ts — keep both in sync
const hexToRGB = (hex: string): string => {
  if (hex.length === 4) hex = hex.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3");
  return hex.length === 7 ? `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}` : hex;
};

const isBrowser = typeof window !== "undefined";

const Moon = {
  currentTheme: "" as Theme,
  _listeners: [] as ((theme: Theme) => void)[],

  init: (theme?: Theme) => {
    if (!isBrowser) return;
    const stored = localStorage.getItem("theme") as Theme;
    Moon.setTheme(theme ?? stored ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  },

  onThemeChange: (cb: (theme: Theme) => void) => {
    Moon._listeners.push(cb);
    return () => {
      Moon._listeners = Moon._listeners.filter((l) => l !== cb);
    };
  },

  setTheme: (theme: Theme) => {
    if (!isBrowser) return;
    localStorage.setItem("theme", theme);
    Moon.currentTheme && document.documentElement.classList.remove(Moon.currentTheme);
    document.documentElement.classList.add(theme);
    Moon.currentTheme = theme;
    Moon._listeners.forEach((cb) => cb(theme));
  },

  removeColors: (colors?: Color[]) => {
    if (!isBrowser) return;
    const keysToRemove = colors ?? (Object.keys(dynamicColors) as Color[]);
    const root = document.documentElement;
    keysToRemove.forEach((key) => {
      root.style.removeProperty(`--${key}`);
      root.style.removeProperty(`--rgb-${key}`);
      delete dynamicColors[key];
    });
  },

  /** Replace all dynamic colors. Old keys not in `colors` are removed. */
  setColors: (colors: SetColors) => {
    if (!isBrowser) return;
    const root = document.documentElement;
    for (const key of Object.keys(dynamicColors)) {
      if (!(colors as any)[key]) {
        root.style.removeProperty(`--${key}`);
        root.style.removeProperty(`--rgb-${key}`);
      }
    }
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, `${value}`);
      root.style.setProperty(`--rgb-${key}`, `${hexToRGB(value!)}`);
    });
    dynamicColors = { ...colors };
  },

  updateColors: (colors: SetColors) => {
    if (!isBrowser) return;
    dynamicColors = { ...dynamicColors, ...colors };
    const root = document.documentElement;
    Object.entries(dynamicColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, `${value}`);
      root.style.setProperty(`--rgb-${key}`, `${hexToRGB(value!)}`);
    });
  },

  setColor: (key: Color, value: string) => {
    if (!isBrowser) return;
    const root = document.documentElement;
    root.style.setProperty(`--${key}`, `${value}`);
    root.style.setProperty(`--rgb-${key}`, `${hexToRGB(value)}`);
  },

  removeColor: (key: Color) => {
    if (!isBrowser) return;
    const root = document.documentElement;
    root.style.removeProperty(`--${key}`);
    root.style.removeProperty(`--rgb-${key}`);
  },
};

export default Moon;

type SetColors = {
  [key in Color]?: string;
};

export { default as moonPlugin } from "./vite-plugin-moon.js";
