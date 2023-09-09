import { Theme, Color } from "./Types";

let dynimcColors: { [key: string]: Color } = {};

export const Moon = {
  currentTheme: "",
  changeTheme: (theme: Theme) => {
    Moon.removeColors();
    Moon.currentTheme && document.documentElement.classList.remove(Moon.currentTheme);
    document.documentElement.classList.add(theme);
    Moon.currentTheme = theme;
  },
  removeColors: () => {
    const root = document.documentElement;
    Object.entries(dynimcColors).forEach(([key, value]) => {
      const theme = root.style.getPropertyValue(`--${key}`);
      if (theme === value) {
        root.style.removeProperty(`--${key}`);
      }
    });
  },
  setColors: (colors: SetColors) => {
    // removeDynimcTheme();
    dynimcColors = { ...colors };
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

interface SetColors {}

export const setThemeVariables = (values: SetColors) => {
  // removeDynimcTheme();
  dynimcColors = { ...values };
  setTimeout(() => {
    const root = document.documentElement;
    Object.entries(dynimcColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, `${value}`);
    });
  }, 0);
};
export const removeColors = () => {
  console.log({ dynimcVaribles: dynimcColors });
  const root = document.documentElement;

  Object.entries(dynimcColors).forEach(([key, value]) => {
    const theme = root.style.getPropertyValue(`--${key}`);
    console.log(theme, value, theme === value);
    // if (theme === value) {
    root.style.removeProperty(`--${key}`);
    // }
  });
};
