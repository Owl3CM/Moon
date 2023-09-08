// Themes
export const getThemes = (themes: { [key: string]: { [key: string]: string } }) => {
  const themeCalls = {} as any;

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
const colorsKeys = {
  bg: "background-color",
  text: "color",
  fill: "fill",
  border: "border-color",
};

// Props
export const getPropsNames = (propName: string) => {
  return PropsByName[propName] ?? [{ name: (n: any) => `${n.replace("-", "")}`, css: (v: any) => `${propName}:${v}` }];
};

export const getDefaultName = (cssName: string) => {
  return (
    {
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
    }[cssName] ?? cssName
  );
};

const PropsByName = {
  padding: [
    { name: (n: any) => `${n.replace("-", "")}`, css: (v: any) => `padding:${v}` },
    { name: (n: any) => `${n}r`, css: (v: any) => `padding-right:${v}` },
    { name: (n: any) => `${n}l`, css: (v: any) => `padding-left:${v}` },
    { name: (n: any) => `${n}t`, css: (v: any) => `padding-top:${v}` },
    { name: (n: any) => `${n}b`, css: (v: any) => `padding-bottom:${v}` },
    { name: (n: any) => `${n}x`, css: (v: any) => `padding-inline:${v}` },
    { name: (n: any) => `${n}y`, css: (v: any) => `padding-block:${v}` },
  ],
  margin: [
    { name: (n: any) => `${n.replace("-", "")}`, css: (v: any) => `margin:${v}` },
    { name: (n: any) => `${n}r`, css: (v: any) => `margin-right:${v}` },
    { name: (n: any) => `${n}l`, css: (v: any) => `margin-left:${v}` },
    { name: (n: any) => `${n}t`, css: (v: any) => `margin-top:${v}` },
    { name: (n: any) => `${n}b`, css: (v: any) => `margin-bottom:${v}` },
    { name: (n: any) => `${n}x`, css: (v: any) => `margin-inline:${v}` },
    { name: (n: any) => `${n}y`, css: (v: any) => `margin-block:${v}` },
  ],
  width: [
    { name: (n: any) => n, css: (v: any) => `width:${v}` },
    { name: (n: any) => `min-${n}`, css: (v: any) => `min-width:${v}` },
    { name: (n: any) => `max-${n}`, css: (v: any) => `max-width:${v}` },
  ],
  height: [
    { name: (n: any) => n, css: (v: any) => `height:${v}` },
    { name: (n: any) => `min-${n}`, css: (v: any) => `min-height:${v}` },
    { name: (n: any) => `max-${n}`, css: (v: any) => `max-height:${v}` },
  ],
  size: [{ name: (n: any) => n, css: (v: any) => `height:${v};width:${v}` }],
  border: [
    { name: (n: any) => n.replace("-", ""), css: (v: any) => `border:${v}` },
    { name: (n: any) => `${n}-t`, css: (v: any) => `border-top:${v}` },
    { name: (n: any) => `${n}-r`, css: (v: any) => `border-right:${v}` },
    { name: (n: any) => `${n}-b`, css: (v: any) => `border-bottom:${v}` },
    { name: (n: any) => `${n}-l`, css: (v: any) => `border-left:${v}` },
    { name: (n: any) => `${n}-x`, css: (v: any) => `border-inline:${v}` },
    { name: (n: any) => `${n}-y`, css: (v: any) => `border-block:${v}` },
  ],
  "border-width": [
    { name: (n: any) => n.replace("-", ""), css: (v: any) => `border-width:${v}` },
    { name: (n: any) => `${n}-t`, css: (v: any) => `border-top-width:${v}` },
    { name: (n: any) => `${n}-r`, css: (v: any) => `border-right-width:${v}` },
    { name: (n: any) => `${n}-b`, css: (v: any) => `border-bottom-width:${v}` },
    { name: (n: any) => `${n}-l`, css: (v: any) => `border-left-width:${v}` },
    { name: (n: any) => `${n}-x`, css: (v: any) => `border-inline-width:${v}` },
    { name: (n: any) => `${n}-y`, css: (v: any) => `border-block-width:${v}` },
  ],
  "border-radius": [
    { name: (n: any) => n.replace("-", ""), css: (v: any) => `border-radius:${v}` },
    { name: (n: any) => `${n}-t`, css: (v: any) => `border-top-left-radius:${v};border-top-right-radius:${v}` },
    { name: (n: any) => `${n}-r`, css: (v: any) => `border-top-right-radius:${v};border-bottom-right-radius:${v}` },
    { name: (n: any) => `${n}-b`, css: (v: any) => `border-bottom-right-radius:${v};border-bottom-left-radius:${v}` },
    { name: (n: any) => `${n}-l`, css: (v: any) => `border-top-left-radius:${v};border-bottom-left-radius:${v}` },
    { name: (n: any) => `${n}-tl`, css: (v: any) => `border-top-left-radius:${v}` },
    { name: (n: any) => `${n}-tr`, css: (v: any) => `border-top-right-radius:${v}` },
    { name: (n: any) => `${n}-br`, css: (v: any) => `border-bottom-right-radius:${v}` },
    { name: (n: any) => `${n}-bl`, css: (v: any) => `border-bottom-left-radius:${v}` },
  ],
} as any;

export const getStaticCss = () => `\n
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
