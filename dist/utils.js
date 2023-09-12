import { Controller } from "./controller.js";
// Colors
export const getColors = (colors) => {
    const themeCalls = {};
    const { options, staticColors, themes } = colors;
    const opacities = options["*"]?.opacities;
    if (opacities) {
        const colorsNames = getColorsNames(themes, staticColors);
        colorsNames.forEach((key) => {
            if (!options[key])
                options[key] = { opacities };
            else if (!options[key].opacities)
                options[key].opacities = opacities;
        });
    }
    Object.entries(options).forEach(([key, values]) => {
        const { opacities } = values;
        if (!opacities)
            return;
        let exist = false;
        Object.keys(themes).forEach((themeKey) => {
            const hex = themes[themeKey][key];
            if (hex) {
                exist = true;
                themes[themeKey][`rgb-${key}`] = hexToRGB(hex);
            }
        });
        Object.entries(staticColors).forEach(([colorKey, colorValue]) => {
            if (!colorKey.includes(key))
                return;
            exist = true;
            staticColors[`rgb-${key}`] = hexToRGB(colorValue);
        });
        if (!exist)
            return;
        opacities.forEach((value) => {
            const colorWithOpacity = `${key}-${value * 1000}`;
            staticColors[colorWithOpacity] = `rgba(var(--rgb-${key}),${value})`;
            if (options[colorWithOpacity] || !options[key])
                return;
            options[colorWithOpacity] = { props: options[key]?.props };
        });
    });
    const root = {
        transparent: "transparent",
        current: "currentColor",
        none: "none",
        black: "#000000",
        white: "#ffffff",
        ...staticColors,
    };
    const themesEntries = Object.entries(themes);
    const themesContent = themesEntries
        .map(([themeKey, themeValues]) => {
        const themeName = `.${themeKey}`;
        return `${themeName} {--${Object.entries(themeValues)
            .map(([key, value]) => {
            if (!key.includes("rgb-"))
                themeCalls[key] = `${value}`;
            return `${key}:${value}`;
        })
            .join(";--")}}`;
    })
        .join("\n");
    const rootContent = `:root{--${Object.entries(root)
        .map(([key, value]) => {
        if (!key.includes("rgb-"))
            themeCalls[key] = `${value}`;
        return `${key}:${value}`;
    })
        .join(";--")}}`;
    const defaultsProps = options["*"]?.props ?? ["bg", "text", "fill", "border"];
    Controller.ColorsVariables = Object.keys(themeCalls);
    const colorsContent = Object.keys(themeCalls)
        .map((key) => {
        const _colorsProps = options[key]?.props ?? defaultsProps;
        return _colorsProps
            .map((cKey) => {
            const cValue = colorsKeys[cKey];
            const className = `.${cKey}-${key} `;
            const classValue = `var(--${key})`;
            return `${className}{${cValue}:${classValue};}`;
        })
            .join(" ");
    })
        .join("\n");
    return `${rootContent}\n${themesContent}\n\n${colorsContent}`;
};
const colorsKeys = {
    bg: "background-color",
    text: "color",
    fill: "fill",
    border: "border-color",
    stroke: "stroke",
};
// Props
export const getPropsNames = (propName) => {
    return PropsByName[propName] ?? [{ name: (n) => `${n.replace("-", "")}`, css: (v) => `${propName}:${v}` }];
};
const hexToRGB = (hex) => hex && hex.length === 7 ? `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}` : hex;
export const getDefaultName = (cssName) => {
    return ({
        padding: "p",
        margin: "m",
        width: "w",
        height: "h",
        color: "text",
        "background-color": "bg",
        "border-radius": "round",
        "border-width": "border",
        "border-color": "border",
        "box-shadow": "shadow",
        "font-size": "text",
        "line-height": "line-h",
        "letter-spacing": "spacing",
        "font-weight": "weight",
        "font-family": "font",
    }[cssName] ?? cssName);
};
const PropsByName = {
    padding: [
        { name: (n) => `${n.replace("-", "")}`, css: (v) => `padding:${v}` },
        { name: (n) => `${n}r`, css: (v) => `padding-right:${v}` },
        { name: (n) => `${n}l`, css: (v) => `padding-left:${v}` },
        { name: (n) => `${n}t`, css: (v) => `padding-top:${v}` },
        { name: (n) => `${n}b`, css: (v) => `padding-bottom:${v}` },
        { name: (n) => `${n}x`, css: (v) => `padding-inline:${v}` },
        { name: (n) => `${n}y`, css: (v) => `padding-block:${v}` },
    ],
    margin: [
        { name: (n) => `${n.replace("-", "")}`, css: (v) => `margin:${v}` },
        { name: (n) => `${n}r`, css: (v) => `margin-right:${v}` },
        { name: (n) => `${n}l`, css: (v) => `margin-left:${v}` },
        { name: (n) => `${n}t`, css: (v) => `margin-top:${v}` },
        { name: (n) => `${n}b`, css: (v) => `margin-bottom:${v}` },
        { name: (n) => `${n}x`, css: (v) => `margin-inline:${v}` },
        { name: (n) => `${n}y`, css: (v) => `margin-block:${v}` },
    ],
    width: [
        { name: (n) => n, css: (v) => `width:${v}` },
        { name: (n) => `min-${n}`, css: (v) => `min-width:${v}` },
        { name: (n) => `max-${n}`, css: (v) => `max-width:${v}` },
    ],
    height: [
        { name: (n) => n, css: (v) => `height:${v}` },
        { name: (n) => `min-${n}`, css: (v) => `min-height:${v}` },
        { name: (n) => `max-${n}`, css: (v) => `max-height:${v}` },
    ],
    size: [{ name: (n) => n, css: (v) => `height:${v};width:${v}` }],
    border: [
        { name: (n) => n.replace("-", ""), css: (v) => `border:${v}` },
        { name: (n) => `${n}-t`, css: (v) => `border-top:${v}` },
        { name: (n) => `${n}-r`, css: (v) => `border-right:${v}` },
        { name: (n) => `${n}-b`, css: (v) => `border-bottom:${v}` },
        { name: (n) => `${n}-l`, css: (v) => `border-left:${v}` },
        { name: (n) => `${n}-x`, css: (v) => `border-inline:${v}` },
        { name: (n) => `${n}-y`, css: (v) => `border-block:${v}` },
    ],
    "border-width": [
        { name: (n) => n.replace("-", ""), css: (v) => `border-width:${v}` },
        { name: (n) => `${n}-t`, css: (v) => `border-top-width:${v}` },
        { name: (n) => `${n}-r`, css: (v) => `border-right-width:${v}` },
        { name: (n) => `${n}-b`, css: (v) => `border-bottom-width:${v}` },
        { name: (n) => `${n}-l`, css: (v) => `border-left-width:${v}` },
        { name: (n) => `${n}-x`, css: (v) => `border-inline-width:${v}` },
        { name: (n) => `${n}-y`, css: (v) => `border-block-width:${v}` },
    ],
    "border-radius": [
        { name: (n) => n.replace("-", ""), css: (v) => `border-radius:${v}` },
        { name: (n) => `${n}-t`, css: (v) => `border-top-left-radius:${v};border-top-right-radius:${v}` },
        { name: (n) => `${n}-r`, css: (v) => `border-top-right-radius:${v};border-bottom-right-radius:${v}` },
        { name: (n) => `${n}-b`, css: (v) => `border-bottom-right-radius:${v};border-bottom-left-radius:${v}` },
        { name: (n) => `${n}-l`, css: (v) => `border-top-left-radius:${v};border-bottom-left-radius:${v}` },
        { name: (n) => `${n}-tl`, css: (v) => `border-top-left-radius:${v}` },
        { name: (n) => `${n}-tr`, css: (v) => `border-top-right-radius:${v}` },
        { name: (n) => `${n}-br`, css: (v) => `border-bottom-right-radius:${v}` },
        { name: (n) => `${n}-bl`, css: (v) => `border-bottom-left-radius:${v}` },
    ],
};
export const getStaticCss = () => `\n
.select-none {user-select:none;} .select-text {user-select:text;} .select-all {user-select:all;} .select-auto {user-select:auto;}
.fixed{position:fixed;} .absolute{position:absolute;} .relative{position:relative;} .sticky {position:-webkit-sticky;position:sticky;} .static{position:static;} .initial{position:initial;} .inherit{position:inherit;} .unset{position:unset;} 
.opacity-0{opacity:0;} .opacity-10{opacity:0.1;} .opacity-20{opacity:0.2;} .opacity-30{opacity:0.3;} .opacity-40{opacity:0.4;} .opacity-50{opacity:0.5;} .opacity-60{opacity:0.6;} .opacity-60{opacity:0.6;} .opacity-70{opacity:0.7;} .opacity-80{opacity:0.8;} .opacity-90{opacity:0.9;} .opacity-100{opacity:1;}
.overflow-auto{overflow:auto;}.overflow-scroll {overflow:scroll;}.overflow-hidden{overflow:hidden;}.overflow-visible{overflow:visible;}
.overflow-x-auto{overflow-x:auto;}.overflow-x-scroll {overflow-x:scroll;}.overflow-x-hidden{overflow-x:hidden;}.overflow-x-visible{overflow-x:visible;}
.overflow-y-auto{overflow-y:auto;}.overflow-y-scroll {overflow-y:scroll;}.overflow-y-hidden{overflow-y:hidden;}.overflow-y-visible{overflow-y:visible;}
.m-auto {margin:auto;} .mt-auto {margin-top:auto;} .mb-auto {margin-bottom:auto;} .ml-auto {margin-left:auto;} .mr-auto {margin-right:auto;} .mx-auto {margin-left:auto; margin-right:auto;} .my-auto {margin-top:auto; margin-bottom:auto;}
.overflow-auto::-webkit-scrollbar {height:var(--scroller-size);width:var(--scroller-size)}
.overflow-auto::-webkit-scrollbar-thumb {border-radius:2px;background-color:var(--scroller-thumb);}
.overflow-auto::-webkit-scrollbar-track {background-color:var(--scroller-bg);border-radius:2px;}
.overflow-auto::-webkit-scrollbar-track {background-color:var(--scroller-bg);}
.hide-scroller::-webkit-scrollbar{display:none;}
.flex-grow {flex-grow:1;}
.flex,.row,.col,.wrap,.center,.row-center,.col-center{display:flex;}
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
.display-none{display:none;}
.display-block{display:block;}
.display-inline{display:inline;}
.display-inline-block{display:inline-block;}
.display-flex{display:flex;}
.display-grid{display:grid;}
.display-table{display:table;}
`;
function getColorsNames(themes, staticColors) {
    return [
        ...Object.values(themes)
            .map((v) => Object.keys(v))
            .flat(),
        ...Object.keys(staticColors),
    ];
}
