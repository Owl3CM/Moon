import { Theme, Color } from "../../../Moon.Types";
declare const Moon: {
    currentTheme: Theme;
    init: (theme?: Theme) => void;
    setTheme: (theme: Theme) => void;
    removeColors: (colors?: Color[]) => void;
    setColors: (colors: SetColors) => void;
    updateColors: (colors: SetColors) => void;
    setColor: (key: Color, value: string) => void;
    removeColor: (key: Color) => void;
};
export default Moon;
type SetColors = {
    [key in Color]?: string;
};
