import { Theme, Color } from "../../../../Moon.Types";
export declare const Moon: {
    currentTheme: string;
    setTheme: (theme: Theme) => void;
    removeColors: (colors?: Color[]) => void;
    setColors: (colors: SetColors) => void;
    updateColors: (colors: SetColors) => void;
    setColor: (key: Color, value: string) => void;
    removeColor: (key: Color) => void;
};
type SetColors = {
    [key in Color]: string;
};
export {};
