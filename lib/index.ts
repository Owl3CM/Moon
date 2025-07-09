import { Theme, Color } from "../Moon.Types";

let dynimcColors: { [key in Color]?: string } = {};
const hexToRGB = (hex: any) => {
  if (hex.length === 4) hex = hex.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3");
  return hex.length === 7 ? `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}` : hex;
};

const Moon = {
  currentTheme: "" as Theme,
  init: (theme: Theme = localStorage.getItem("theme") as Theme) => {
    Moon.setTheme(theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  },
  setTheme: (theme: Theme) => {
    localStorage.setItem("theme", theme);
    Moon.removeColors();
    Moon.currentTheme && document.documentElement.classList.remove(Moon.currentTheme);
    document.documentElement.classList.add(theme);
    Moon.currentTheme = theme;
  },
  removeColors: (colors?: Color[]) => {
    if (!colors) colors = Object.keys(dynimcColors) as Color[];
    const root = document.documentElement;
    colors.forEach((key) => {
      // const theme = root.style.getPropertyValue(`--${key}`);
      // if (theme === value) {
      root.style.removeProperty(`--${key}`);
      root.style.removeProperty(`--rgb-${key}`);
      // }
    });
  },
  setColors: (colors: SetColors) => {
    setTimeout(() => {
      const root = document.documentElement;
      const dynimcEntries = Object.entries(dynimcColors);
      if (dynimcEntries?.length)
        dynimcEntries.forEach(([key, value]) => {
          if (!(colors as any)[key]) {
            root.style.removeProperty(`--${key}`);
            root.style.removeProperty(`--rgb-${key}`);
          } else {
            root.style.setProperty(`--${key}`, `${value}`);
            root.style.setProperty(`--rgb-${key}`, `${hexToRGB(value)}`);
          }
        });
      else {
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, `${value}`);
          root.style.setProperty(`--rgb-${key}`, `${hexToRGB(value)}`);
        });
      }
      dynimcColors = { ...colors };
    }, 0);
  },
  updateColors: (colors: SetColors) => {
    dynimcColors = { ...dynimcColors, ...colors };
    setTimeout(() => {
      const root = document.documentElement;
      Object.entries(dynimcColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, `${value}`);
        root.style.setProperty(`--rgb-${key}`, `${hexToRGB(value)}`);
      });
    }, 0);
  },
  setColor: (key: Color, value: string) => {
    const root = document.documentElement;
    root.style.setProperty(`--${key}`, `${value}`);
    root.style.setProperty(`--rgb-${key}`, `${hexToRGB(value)}`);
  },
  removeColor: (key: Color) => {
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
