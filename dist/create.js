import { Controller } from "./controller.js";
export const getRootCss = async () => {
    let cssContent = "";
    const { sizes, themes, "box-shadow": boxShadow, "border-radius": borderRadius, "border-width": borderWidth, "z-index": zIndex } = Controller.config;
    const sizesEntries = Object.entries(sizes);
    cssContent += getSizes(sizesEntries);
    cssContent += getThemes(themes);
    cssContent += getBoxShadow(boxShadow);
    cssContent += getBorderRadius(borderRadius);
    cssContent += getBorderWidth(borderWidth);
    cssContent += getZIndex(zIndex);
    return cssContent;
};
const getBoxShadow = (boxShadow) => {
    return ("\n\n" +
        Object.entries(boxShadow)
            .map(([key, value]) => {
            const className = `.shadow-${key} `;
            const extraSpace = spaces[20 - className.length] ?? "";
            const classValue = `${value}`;
            const extraSpace2 = spaces[20 - classValue.length] ?? "";
            return `${className}${extraSpace}{box-shadow: ${classValue};}${extraSpace2}`;
        })
            .join("\n"));
};
const getThemes = (themes) => {
    const themeCalls = {};
    themes.root = {
        transparent: "transparent",
        current: "currentColor",
        none: "none",
        black: "#000000",
        white: "#ffffff",
        ...themes.root,
    };
    const themesEntries = Object.entries(themes);
    const _themes = "\n\n" +
        themesEntries
            .map(([themeKey, themeValue]) => {
            const themeName = themeKey === "root" ? ":root" : `.${themeKey}`;
            return `${themeName} { --${Object.entries(themeValue)
                .map(([key, value]) => {
                themeCalls[key] = `${value}`;
                return `${key}:${value}`;
            })
                .join("; --")}}`;
        })
            .join("\n");
    const _themesValues = Object.entries(themeCalls)
        .map(([key, value]) => {
        return Object.entries(colorsKeys)
            .map(([cKey, cValue]) => {
            const className = `.${cKey}-${key} `;
            const extraSpace = spaces[20 - className.length] ?? "";
            const classValue = `var(--${key})`;
            const extraSpace2 = spaces[20 - classValue.length] ?? "";
            return `${className}${extraSpace}{${cValue}: ${classValue};}${extraSpace2}`;
        })
            .join(" ");
    })
        .join("\n");
    return `${_themes}\n\n${_themesValues}`;
};
function getSizes(sizesEntries) {
    return Object.entries(sizesKeys)
        .map(([sk, sv]) => sizesEntries.map(([_key, _value]) => ` .${sk}-${_key} { ${sv}:${_value}}`).join(""))
        .join("\n");
}
function getZIndex(zIndex) {
    return ("\n\n" +
        Object.entries(zIndex)
            .map(([key, value]) => {
            const className = `.z-${key} `;
            const extraSpace = spaces[5 - className.length] ?? "";
            const classValue = `${value}`;
            const extraSpace2 = spaces[5 - classValue.length] ?? "";
            return `${className}${extraSpace}{z-index: ${classValue};}${extraSpace2}`;
        })
            .join(""));
}
function getBorderRadius(borderRadius) {
    return ("\n\n" +
        Object.entries(borderRadius)
            .map(([key, value]) => {
            return Object.entries(borderKeys)
                .map(([bk, bv]) => {
                const className = `.round${bk}-${key} `;
                const extraSpace = spaces[20 - className.length] ?? "";
                const classValue = `${value}`;
                const extraSpace2 = spaces[20 - classValue.length] ?? "";
                return `${className}${extraSpace}{${bv(classValue)};}${extraSpace2}`;
            })
                .join(" ");
        })
            .join("\n"));
}
const borderKeys = {
    "": (v) => `border-radius:${v};`,
    "-t": (v) => `border-top-left-radius:${v};border-top-right-radius:${v};`,
    "-r": (v) => `border-top-right-radius:${v};border-bottom-right-radius:${v};`,
    "-b": (v) => `border-bottom-right-radius:${v};border-bottom-left-radius:${v};`,
    "-l": (v) => `border-top-left-radius:${v};border-bottom-left-radius:${v};`,
    "-x": (v) => `border-top-left-radius:${v};border-top-right-radius:${v};border-bottom-right-radius:${v};border-bottom-left-radius:${v};`,
    "-y": (v) => `border-top-left-radius:${v};border-top-right-radius:${v};border-bottom-right-radius:${v};border-bottom-left-radius:${v};`,
};
function getBorderWidth(borderWidth) {
    return ("\n\n" +
        Object.entries(borderWidth)
            .map(([key, value]) => {
            return Object.entries(borderWidthKeys)
                .map(([bk, bv]) => {
                const className = `.border${bk}-${key} `;
                const extraSpace = spaces[20 - className.length] ?? "";
                const classValue = `${value}`;
                const extraSpace2 = spaces[20 - classValue.length] ?? "";
                return `${className}${extraSpace}{${bv}-width: ${classValue};}${extraSpace2}`;
            })
                .join(" ");
        })
            .join("\n"));
}
const borderWidthKeys = {
    "": "border",
    "-t": "border-top",
    "-r": "border-right",
    "-b": "border-bottom",
    "-l": "border-left",
    "-x": "border-inline",
    "-y": "border-block",
};
//
const sizesKeys = {
    p: "padding",
    pr: "padding-right",
    pl: "padding-left",
    pt: "padding-top",
    pb: "padding-bottom",
    m: "margin",
    mr: "margin-right",
    ml: "margin-left",
    mt: "margin-top",
    mb: "margin-bottom",
    mx: "margin-inline",
    my: "margin-block",
    w: "width",
    h: "height",
    "min-w": "min-width",
    "min-h": "min-height",
    "max-w": "max-width",
    "max-h": "max-height",
    top: "top",
    right: "right",
    bottom: "bottom",
    left: "left",
    inset: "inset",
    size: "size",
    gap: "gap",
};
// bw: "border-width",
// fs: "font-size",
// fw: "font-weight",
const colorsKeys = {
    bg: "background-color",
    text: "color",
    fill: "fill",
    border: "border-color",
};
const spaces = ["", " ", "  ", "   ", "    ", "     ", "      ", "       ", "        ", "         ", "          ", "           ", "            "];
