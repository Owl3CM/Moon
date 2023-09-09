import { Theme, Color } from "./Types";

let dynimcColors: { [key in Color]: string } = {} as any;

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
      // }
    });
  },
  setColors: (colors: SetColors) => {
    dynimcColors = { ...dynimcColors, ...colors };
    Object.entries(dynimcColors).forEach(([key, value]) => {
      const root = document.documentElement;
      if (!(colors as any)[key]) root.style.removeProperty(`--${key}`);
      else root.style.setProperty(`--${key}`, `${value}`);
    });

    setTimeout(() => {
      const root = document.documentElement;
      Object.entries(dynimcColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, `${value}`);
      });
    }, 0);
  },
  updateColors: (colors: SetColors) => {
    dynimcColors = { ...dynimcColors, ...colors };
    setTimeout(() => {
      const root = document.documentElement;
      Object.entries(dynimcColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, `${value}`);
      });
    }, 0);
  },
  setColor: (key: Color, value: string) => {
    const root = document.documentElement;
    root.style.setProperty(`--${key}`, `${value}`);
  },
  removeColor: (key: Color) => {
    const root = document.documentElement;
    root.style.removeProperty(`--${key}`);
  },
};

type SetColors = {
  [key in Color]: string;
};
