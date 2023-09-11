import { Theme, Color } from "./Types";

let dynimcColors: { [key in Color]: string } = {} as any;
const hexToRGB = (hex: string) =>
  hex && hex.length === 7 ? `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}` : hex;

export const Moon = {
  currentTheme: "",
  setTheme: (theme: Theme) => {
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
      Object.entries(dynimcColors).forEach(([key, value]) => {
        if (!(colors as any)[key]) {
          root.style.removeProperty(`--${key}`);
          root.style.removeProperty(`--rgb-${key}`);
        } else {
          root.style.setProperty(`--${key}`, `${value}`);
          root.style.setProperty(`--rgb-${key}`, `${hexToRGB(value)}`);
        }
      });
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

type SetColors = {
  [key in Color]: string;
};
