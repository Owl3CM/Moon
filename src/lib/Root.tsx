const root = {
  theme: "",
  changeTheme: (theme: string) => {
    root.theme && document.documentElement.classList.remove(root.theme);
    document.documentElement.classList.add(theme);
    root.theme = theme;
  },
};

export const changeTheme = (theme: string) => root.changeTheme(theme);
export const currentTheme = () => root.theme;
