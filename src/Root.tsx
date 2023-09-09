import { Theme } from "../moon/Types";
const Moon = {
  theme: "",
  changeTheme: (theme: Theme) => {
    Moon.theme && document.documentElement.classList.remove(Moon.theme);
    document.documentElement.classList.add(theme);
    Moon.theme = theme;
  },
};

export const changeTheme = (theme: Theme) => {
  removeColors();
  Moon.changeTheme(theme);
};
export const currentTheme = () => Moon.theme;

interface SetThemeVariables {
  values: {
    [key: string]: string;
  };
}

let dynimcColors: { [key: string]: string } = {};

export const setThemeVariables = ({ values }: SetThemeVariables) => {
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
