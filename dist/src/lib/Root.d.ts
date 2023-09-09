import { Theme, Color } from "../../moon/Types";
export declare const Moon: {
    currentTheme: string;
    changeTheme: (theme: Theme) => void;
    removeColors: () => void;
    setColors: (colors: SetColors) => void;
    setColor: (key: Color, value: string) => void;
    removeColor: (key: Color) => void;
};
interface SetColors {
}
export declare const setThemeVariables: (values: SetColors) => void;
export declare const removeColors: () => void;
export {};
