import { Controller } from "./controller.js";
export const getRootCss = async () => {
    let cssContent = "";
    const { sizes, themes, "box-shadow": boxShadow, "border-radius": borderRadius, "border-width": borderWidth, "z-index": zIndex } = Controller.config;
    const sizesEntries = Object.entries(sizes);
    cssContent += getThemes(themes);
    cssContent += getSizes(sizesEntries);
    cssContent += getBorderRadius(borderRadius);
    cssContent += getBorderWidth(borderWidth);
    cssContent += getBoxShadow(boxShadow);
    cssContent += getZIndex(zIndex);
    cssContent += getStaticCss();
    return cssContent;
};
const getBoxShadow = (boxShadow) => {
    return ("\n\n" +
        Object.entries(boxShadow)
            .map(([key, value]) => {
            const className = `.shadow-${key} `;
            const classValue = `${value}`;
            return `${className}{box-shadow:${classValue};}`;
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
    const _themes = themesEntries
        .map(([themeKey, themeValue]) => {
        const themeName = themeKey === "root" ? ":root" : `.${themeKey}`;
        return `${themeName} {--${Object.entries(themeValue)
            .map(([key, value]) => {
            themeCalls[key] = `${value}`;
            return `${key}:${value}`;
        })
            .join(";--")}}`;
    })
        .join("\n");
    const _themesValues = Object.entries(themeCalls)
        .map(([key, value]) => {
        return Object.entries(colorsKeys)
            .map(([cKey, cValue]) => {
            const className = `.${cKey}-${key} `;
            const classValue = `var(--${key})`;
            return `${className}{${cValue}:${classValue};}`;
        })
            .join(" ");
    })
        .join("\n");
    return `${_themes}\n\n${_themesValues}`;
};
function getSizes(sizesEntries) {
    return ("\n\n" +
        Object.entries(sizesKeys)
            .map(([sk, sv]) => sizesEntries.map(([_key, _value]) => ` .${sk}-${_key} { ${sv}:${_value}}`).join(""))
            .join("\n"));
}
function getZIndex(zIndex) {
    return ("\n\n" +
        Object.entries(zIndex)
            .map(([key, value]) => {
            const className = `.z-${key} `;
            const classValue = `${value}`;
            return `${className}{z-index:${classValue};}`;
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
                const classValue = `${value}`;
                return `${className}{${bv(classValue)};}`;
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
                const classValue = `${value}`;
                return `${className}{${bv}-width:${classValue};}`;
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
const colorsKeys = {
    bg: "background-color",
    text: "color",
    fill: "fill",
    border: "border-color",
};
const getStaticCss = () => {
    return `
.select-none {user-select:none;} .select-text {user-select:text;} .select-all {user-select:all;} .select-auto {user-select:auto;}
.fixed{position:fixed;} .absolute{position:absolute;} .relative{position:relative;} .sticky {position:-webkit-sticky;position:sticky;} .static{position:static;} .initial{position:initial;} .inherit{position:inherit;} .unset{position:unset;} 
.opacity-0{opacity:0;} .opacity-10{opacity:0.1;} .opacity-20{opacity:0.2;} .opacity-30{opacity:0.3;} .opacity-40{opacity:0.4;} .opacity-50{opacity:0.5;} .opacity-60{opacity:0.6;} .opacity-60{opacity:0.6;} .opacity-70{opacity:0.7;} .opacity-80{opacity:0.8;} .opacity-90{opacity:0.9;} .opacity-100{opacity:1;}
.overflow-auto{overflow:auto;}.overflow-scroll {overflow:scroll;}.overflow-hidden{overflow:hidden;}.overflow-visible{overflow:visible;}
.overflow-x-auto{overflow-x:auto;}.overflow-x-scroll {overflow-x:scroll;}.overflow-x-hidden{overflow-x:hidden;}.overflow-x-visible{overflow-x:visible;}
.overflow-y-auto{overflow-y:auto;}.overflow-y-scroll {overflow-y:scroll;}.overflow-y-hidden{overflow-y:hidden;}.overflow-y-visible{overflow-y:visible;}
.bg-transparent {background-color:transparent !important;} .bg-none {background-color:unset!important;} 
.text-transparent {color:transparent !important;} .text-none {color:unset!important;}
.fill-transparent {fill:transparent !important;} .fill-none {fill:unset!important;}
.m-auto {margin:auto;} .mt-auto {margin-top:auto;} .mb-auto {margin-bottom:auto;} .ml-auto {margin-left:auto;} .mr-auto {margin-right:auto;} .mx-auto {margin-left:auto; margin-right:auto;} .my-auto {margin-top:auto; margin-bottom:auto;}
.overflow-auto::-webkit-scrollbar {height:var(--scroller-size);width:var(--scroller-size)}
.overflow-auto::-webkit-scrollbar-thumb {border-radius:2px;background-color:var(--scroller-thumb);}
.overflow-auto::-webkit-scrollbar-track {background-color:var(--scroller-bg);border-radius:2px;}
.overflow-auto::-webkit-scrollbar-track {background-color:var(--scroller-bg);}
.hide-scroller::-webkit-scrollbar{display:none;}
.flex-grow {flex-grow:1;}
.flex,.row,.col,.wrap,.center{display:flex;}
.row,.row-center,.row-start,.row-end{flex-direction:row;}
.row-center,.center{align-items:center;}
.row-start{align-items:flex-start;}
.row-end{align-items:flex-end;}
.col,.col-center,.col-start,.col-end{flex-direction:column;}
.col-center,.center{justify-content:center;}
.col-start{justify-content:flex-start;}
.col-end{justify-content:flex-end;}
.wrap{ flex-wrap:wrap;}
.h-screen{height:100vh;}
.w-screen{width:100vw;}    
.w-fill{width:100%;} 
.h-fill{height:100%;}
.min-w-max{min-width:max-content;} 
.items-center {align-items:center;}
.items-start {align-items:flex-start;}
.items-end {align-items:flex-end;}
.justify-center {justify-content:center;}
.justify-start {justify-content:flex-start;}
.justify-end {justify-content:flex-end;}
.justify-between {justify-content:space-between;}
.justify-around {justify-content:space-around;}
.justify-evenly {justify-content:space-evenly;}
.self-start {align-self:flex-start;}
.self-center {align-self:center;}  
.self-end {align-self:flex-end;}
.self-stretch {align-self:stretch;}
.col-span-full{grid-column:1 / -1;}    
.col-span-1{grid-column:span 1 / span 1;}
.col-span-2{grid-column:span 2 / span 2;}
.col-span-3{grid-column:span 3 / span 3;}
.row-span-full {grid-row:1/-1;}
.row-span-1{grid-row:span 1 / span 1;}
.row-span-2{grid-row:span 2 / span 2;}
.row-span-3{grid-row:span 3 / span 3;}
.text-center{text-align:center;}
.text-left{text-align:left;}
.text-right{text-align:right;} 
.pointer{cursor:pointer;}
.cursor-default{cursor:default;}
.cursor-cursor{cursor:w-resize;}
.pointer-none{pointer-events:none;}
.pointer-auto{pointer-events:auto;}
.pointer-all{pointer-events:all;}
`;
};
