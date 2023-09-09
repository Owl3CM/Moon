import { Theme } from "../moon/Types";
export declare const changeTheme: (theme: Theme) => void;
export declare const currentTheme: () => string;
interface SetThemeVariables {
    values: {
        [key: string]: string;
    };
}
export declare const setThemeVariables: ({ values }: SetThemeVariables) => void;
export declare const removeColors: () => void;
export {};
