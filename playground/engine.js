// Moon-Style Browser Builder Engine
// Ported from the Node.js builder — pure computation, no filesystem deps
(function(){
'use strict';

// ─── Utils (from builder/utils.ts) ────────────────────────────────────────────

const hexToRGB = (hex) => {
  if (!hex) return '0, 0, 0';
  if (hex.length === 4) hex = hex.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3');
  return hex.length === 7
    ? `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}`
    : hex;
};

const PropsByName = {
  padding: [
    { name: (n) => `${n}`, css: (v) => `padding:${v}` },
    { name: (n) => `${n}r`, css: (v) => `padding-right:${v}` },
    { name: (n) => `${n}l`, css: (v) => `padding-left:${v}` },
    { name: (n) => `${n}t`, css: (v) => `padding-top:${v}` },
    { name: (n) => `${n}b`, css: (v) => `padding-bottom:${v}` },
    { name: (n) => `${n}x`, css: (v) => `padding-inline:${v}` },
    { name: (n) => `${n}y`, css: (v) => `padding-block:${v}` },
    { name: (n) => `${n}s`, css: (v) => `padding-inline-start:${v}` },
    { name: (n) => `${n}e`, css: (v) => `padding-inline-end:${v}` },
  ],
  margin: [
    { name: (n) => `${n}`, css: (v) => `margin:${v}` },
    { name: (n) => `${n}r`, css: (v) => `margin-right:${v}` },
    { name: (n) => `${n}l`, css: (v) => `margin-left:${v}` },
    { name: (n) => `${n}t`, css: (v) => `margin-top:${v}` },
    { name: (n) => `${n}b`, css: (v) => `margin-bottom:${v}` },
    { name: (n) => `${n}x`, css: (v) => `margin-inline:${v}` },
    { name: (n) => `${n}y`, css: (v) => `margin-block:${v}` },
    { name: (n) => `${n}s`, css: (v) => `margin-inline-start:${v}` },
    { name: (n) => `${n}e`, css: (v) => `margin-inline-end:${v}` },
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
  'border-width': [
    { name: (n) => n, css: (v) => `border-width:${v}` },
    { name: (n) => `${n}-t`, css: (v) => `border-top-width:${v}` },
    { name: (n) => `${n}-r`, css: (v) => `border-right-width:${v}` },
    { name: (n) => `${n}-b`, css: (v) => `border-bottom-width:${v}` },
    { name: (n) => `${n}-l`, css: (v) => `border-left-width:${v}` },
    { name: (n) => `${n}-x`, css: (v) => `border-inline-width:${v}` },
    { name: (n) => `${n}-y`, css: (v) => `border-block-width:${v}` },
  ],
  'border-radius': [
    { name: (n) => n, css: (v) => `border-radius:${v}` },
    { name: (n) => `${n}-t`, css: (v) => `border-top-left-radius:${v};border-top-right-radius:${v}` },
    { name: (n) => `${n}-r`, css: (v) => `border-top-right-radius:${v};border-bottom-right-radius:${v}` },
    { name: (n) => `${n}-b`, css: (v) => `border-bottom-right-radius:${v};border-bottom-left-radius:${v}` },
    { name: (n) => `${n}-l`, css: (v) => `border-top-left-radius:${v};border-bottom-left-radius:${v}` },
  ],
  blur: [{ name: (n) => n, css: (v) => `filter:blur(${v})` }],
  'backdrop-blur': [{ name: (n) => n, css: (v) => `backdrop-filter:blur(${v})` }],
  'box-shadow': [{ name: (n) => n, css: (v) => `box-shadow:${v}` }],
  'font-size': [{ name: (n) => n, css: (v) => `font-size:${v}` }],
  'line-height': [{ name: (n) => n, css: (v) => `line-height:${v}` }],
  'font-weight': [{ name: (n) => n, css: (v) => `font-weight:${v}` }],
  'font-family': [{ name: (n) => n, css: (v) => `font-family:${v}` }],
  'z-index': [{ name: (n) => n, css: (v) => `z-index:${v}` }],
  opacity: [{ name: (n) => n, css: (v) => `opacity:${v}` }],
  transition: [{ name: (n) => n, css: (v) => `transition:${v}` }],
  'border-style': [{ name: (n) => n, css: (v) => `border-style:${v}` }],
  display: [{ name: (n) => n, css: (v) => `display:${v}` }],
  brightness: [{ name: (n) => n, css: (v) => `filter:brightness(${v})` }],
  contrast: [{ name: (n) => n, css: (v) => `filter:contrast(${v})` }],
  saturate: [{ name: (n) => n, css: (v) => `filter:saturate(${v})` }],
  invert: [{ name: (n) => n, css: (v) => `filter:invert(${v})` }],
  sepia: [{ name: (n) => n, css: (v) => `filter:sepia(${v})` }],
  'hue-rotate': [{ name: (n) => n, css: (v) => `filter:hue-rotate(${v})` }],
  gap: [{ name: (n) => n, css: (v) => `gap:${v}` }],
  inset: [{ name: (n) => n, css: (v) => `inset:${v}` }],
  top: [{ name: (n) => n, css: (v) => `top:${v}` }],
  left: [{ name: (n) => n, css: (v) => `left:${v}` }],
  right: [{ name: (n) => n, css: (v) => `right:${v}` }],
  bottom: [{ name: (n) => n, css: (v) => `bottom:${v}` }],
};

const getPropsNames = (propName) => PropsByName[propName] ?? [{ name: (n) => `${n}`, css: (v) => `${propName}:${v}` }];

const getDefaultName = (cssName) => ({
  padding: 'p', margin: 'm', width: 'w', height: 'h', color: 'text',
  'background-color': 'bg', 'border-radius': 'round', 'border-width': 'border',
  'box-shadow': 'shadow', 'font-size': 'text', 'font-weight': 'weight',
  'font-family': 'font', 'line-height': 'line-h',
}[cssName] ?? cssName);

// ─── Static CSS (from buildStaticClasses.ts) ──────────────────────────────────

const STATIC_CSS = `.select-none{user-select:none;}.select-text{user-select:text;}.select-all{user-select:all;}.select-auto{user-select:auto;}
.fixed{position:fixed;}.absolute{position:absolute;}.relative{position:relative;}.sticky{position:-webkit-sticky;position:sticky;}.static{position:static;}.initial{position:initial;}.inherit{position:inherit;}.unset{position:unset;}
.opacity-0{opacity:0;}.opacity-10{opacity:0.1;}.opacity-20{opacity:0.2;}.opacity-30{opacity:0.3;}.opacity-40{opacity:0.4;}.opacity-50{opacity:0.5;}.opacity-60{opacity:0.6;}.opacity-70{opacity:0.7;}.opacity-80{opacity:0.8;}.opacity-90{opacity:0.9;}.opacity-100{opacity:1;}
.overflow-auto{overflow:auto;}.overflow-scroll{overflow:scroll;}.overflow-hidden{overflow:hidden;}.overflow-visible{overflow:visible;}
.overflow-x-auto{overflow-x:auto;}.overflow-x-scroll{overflow-x:scroll;}.overflow-x-hidden{overflow-x:hidden;}.overflow-x-visible{overflow-x:visible;}
.overflow-y-auto{overflow-y:auto;}.overflow-y-scroll{overflow-y:scroll;}.overflow-y-hidden{overflow-y:hidden;}.overflow-y-visible{overflow-y:visible;}
.m-auto{margin:auto;}.mt-auto{margin-top:auto;}.mb-auto{margin-bottom:auto;}.ml-auto{margin-left:auto;}.mr-auto{margin-right:auto;}.mx-auto{margin-left:auto;margin-right:auto;}.my-auto{margin-top:auto;margin-bottom:auto;}
.hide-scroller::-webkit-scrollbar{display:none;}
.flex-grow{flex-grow:1;}
.flex,.row,.col,.wrap,.center,.row-center,.col-center{display:flex;}
.row,.row-center,.row-start,.row-end{flex-direction:row;}
.row-center,.center{align-items:center;}
.row-start{align-items:flex-start;}
.row-end{align-items:flex-end;}
.col,.col-center,.col-start,.col-end{flex-direction:column;}
.col-center,.center{justify-content:center;}
.col-start{justify-content:flex-start;}
.col-end{justify-content:flex-end;}
.wrap{flex-wrap:wrap;}
.h-screen{height:100vh;}.w-screen{width:100vw;}.w-fill{width:100%;}.h-fill{height:100%;}
.min-w-max{min-width:max-content;}
.items-center{align-items:center;}.items-start{align-items:flex-start;}.items-end{align-items:flex-end;}
.justify-center{justify-content:center;}.justify-start{justify-content:flex-start;}.justify-end{justify-content:flex-end;}.justify-between{justify-content:space-between;}.justify-around{justify-content:space-around;}.justify-evenly{justify-content:space-evenly;}
.self-start{align-self:flex-start;}.self-center{align-self:center;}.self-end{align-self:flex-end;}.self-stretch{align-self:stretch;}
.col-span-full{grid-column:1/-1;}.col-span-1{grid-column:span 1/span 1;}.col-span-2{grid-column:span 2/span 2;}.col-span-3{grid-column:span 3/span 3;}
.row-span-full{grid-row:1/-1;}.row-span-1{grid-row:span 1/span 1;}.row-span-2{grid-row:span 2/span 2;}.row-span-3{grid-row:span 3/span 3;}
.text-center{text-align:center;}.text-left{text-align:left;}.text-right{text-align:right;}
.pointer{cursor:pointer;}.cursor-default{cursor:default;}.pointer-none{pointer-events:none;}.pointer-auto{pointer-events:auto;}.pointer-all{pointer-events:all;}
.display-none{display:none;}.display-block{display:block;}.display-inline{display:inline;}.display-inline-block{display:inline-block;}.display-flex{display:flex;}.display-grid{display:grid;}.display-table{display:table;}`;

// ─── Color Builder (from buildColors.ts) ──────────────────────────────────────

const DEFAULT_COLOR_PROPS = ['bg', 'text', 'fill', 'border'];
const colorsKeys = { bg: 'background-color', text: 'color', fill: 'fill', border: 'border-color', stroke: 'stroke' };

function buildColors(colorConfig) {
  if (!colorConfig) return { css: '', classes: {} };
  const { staticColors = {}, themes = {}, options: sourceOptions = {} } = colorConfig;
  const themesCopy = JSON.parse(JSON.stringify(themes));
  const generatedClasses = {};
  const allColorNames = [
    ...new Set([
      ...Object.values(themesCopy).flatMap(t => Object.keys(t)),
      ...Object.keys(staticColors),
    ]),
  ];

  const root = {};
  Object.entries(staticColors).forEach(([key, value]) => {
    root[`rgb-${key}`] = hexToRGB(value);
    root[key] = `rgb(var(--rgb-${key}))`;
  });

  Object.keys(themesCopy).forEach((key) => {
    const theme = themesCopy[key];
    const rgbTheme = {};
    Object.entries(theme).forEach(([cK, hex]) => {
      rgbTheme[`rgb-${cK}`] = hexToRGB(hex);
      root[cK] = `rgb(var(--rgb-${cK}))`;
    });
    themesCopy[key] = rgbTheme;
  });

  // Handle options
  const options = { ...sourceOptions };
  let defaultProps = DEFAULT_COLOR_PROPS;
  if (options['*']) {
    const { opacities, props } = options['*'];
    defaultProps = props ?? DEFAULT_COLOR_PROPS;
    allColorNames.forEach((key) => {
      if (!options[key]) options[key] = { opacities };
      else if (!options[key].opacities) options[key] = { ...options[key], opacities };
    });
    delete options['*'];
  }

  // Generate opacity variants
  Object.entries(options).forEach(([colorName, { opacities }]) => {
    if (!opacities) return;
    opacities.forEach((value) => {
      const key = `${colorName}-${value * 1000}`;
      root[key] = `rgba(var(--rgb-${colorName}),${value})`;
      if (!options[key] && options[colorName]) {
        options[key] = { props: options[colorName].props };
      }
    });
  });

  // Build CSS
  const themesCSS = Object.entries({ root, ...themesCopy })
    .map(([tk, tv]) => `${tk === 'root' ? ':' : '.'}${tk}{${Object.entries(tv).map(([k, v]) => `--${k}:${v};`).join('')}}`)
    .join('\n');

  let classesCSS = '';
  Object.keys(root).forEach((key) => {
    if (key.startsWith('rgb-')) return;
    const colorProps = options[key]?.props ?? defaultProps;
    colorProps?.forEach((propKey) => {
      const cls = `${propKey}-${key}`;
      const cssProp = colorsKeys[propKey];
      if (!cssProp) return;
      const val = `${cssProp}:var(--${key})`;
      classesCSS += `.${cls}{${val};} `;
      generatedClasses[cls] = val;
    });
    classesCSS += '\n';
  });

  return { css: `${themesCSS}\n\n${classesCSS}`, classes: generatedClasses, themes: Object.keys(themes) };
}

// ─── Styles Builder (from buildStyles.ts) ─────────────────────────────────────

function buildStyles(stylesConfig, useStaticNumbers = false) {
  const variables = [];
  const generatedClasses = {};
  const propsByShortNames = {
    bg: 'background-color', text: 'color', round: 'border-radius',
    content: (v) => `content:attr(data-${v})`,
    m: (v) => `margin:${v}`,
  };
  let cssContent = '';

  (stylesConfig || []).forEach(({ props, values, variableName }) => {
    if (!props || !Object.keys(props).length) {
      Object.entries(values).forEach(([vk, vv]) => {
        variables.push(`--${variableName ? variableName + '-' : ''}${vk}:${vv};`);
      });
      return;
    }
    Object.entries(values).forEach(([shortName, property]) => {
      const varName = `--${variableName ? variableName + '-' : ''}${shortName}`;
      variables.push(`${varName}:${property};`);
      const valueName = useStaticNumbers ? property : `var(${varName})`;
      Object.entries(props).forEach(([prop, shortN]) => {
        const extraProps = getPropsNames(prop);
        const _shortN = shortN ?? getDefaultName(prop);
        extraProps.forEach(({ name, css }) => {
          const _name = name(_shortN);
          propsByShortNames[_name] = css;
          const dash = _name && shortName ? '-' : '';
          const className = `${_name}${dash}${shortName}`;
          const classValue = css(valueName);
          generatedClasses[className] = classValue;
          cssContent += `.${className}{${classValue};}`;
        });
      });
      cssContent += '\n';
    });
  });

  return {
    css: `:root{\n${variables.join('\n')}\n}\n${cssContent}`,
    classes: generatedClasses,
    propsByShortNames,
  };
}

// ─── JIT Engine (from jit/jit.ts) ─────────────────────────────────────────────

const JIT_COLOR_PROPS = {
  bg: 'background-color', text: 'color', fill: 'fill', border: 'border-color',
  stroke: 'stroke', 'border-r': 'border-right-color', 'border-l': 'border-left-color',
  'border-t': 'border-top-color', 'border-b': 'border-bottom-color',
};

const jitPatterns = {
  actions: /([a-zA-Z0-9-:]+):\[([a-zA-Z0-9-,:#%]+)\]/g,
  colors: /([a-zA-Z0-9-]+):#([a-zA-Z0-9-]+)/g,
  spacing: /([a-zA-Z0-9-]+):([0-9]+(px|rem|%|vw|vh|em|ch|ex|cm|mm|in|pt|pc))/g,
};

function runJit(content, generatedClasses = {}, propsByShortNames = {}, screens = {}) {
  const jitGenerated = {};

  // Extract actions
  const actionMatches = content.match(jitPatterns.actions);
  actionMatches?.forEach((match) => {
    if (jitGenerated[match]) return;
    let screen;
    const data = match.split(':[');
    const rest = data[0].split(':');
    const classes = data[1].slice(0, -1).split(',');
    const cleanClassesName = classes.join('\\,').split(':').join('\\:').split('#').join('\\#').split('%').join('\\%');
    let name = rest.join('\\:') + `\\:\\[${cleanClassesName}\\]`;
    rest.forEach((act) => {
      const _screen = screens[act];
      if (_screen) { screen = _screen; }
      else if (act === 'before' || act === 'after') {
        classes.push(`content:${act}`);
        name += `::${act}`;
      } else name += `:${act}`;
    });
    const classValueContent = classes.map((className) => {
      let v = generatedClasses[className];
      if (!v) {
        const [propName, colorValue] = className.split(':');
        if (colorValue?.startsWith('#')) {
          v = `${JIT_COLOR_PROPS[propName] ?? propName}:${colorValue}`;
        } else {
          const func = propsByShortNames[propName];
          v = typeof func === 'function' ? func(colorValue) : `${propName}:${colorValue}`;
        }
      }
      return `${v};`;
    }).join('');
    const generated = `.${name}{${classValueContent}}`;
    jitGenerated[match] = screen ? `@media (max-width: ${screen}){${generated}}` : generated;
  });

  // Extract colors
  const colorMatches = content.match(jitPatterns.colors);
  colorMatches?.forEach((match) => {
    if (jitGenerated[match]) return;
    const [propName, colorValue] = match.split(':');
    const resolved = JIT_COLOR_PROPS[propName];
    if (!resolved) return;
    const name = `${propName}\\:\\#${colorValue}`;
    jitGenerated[match] = `.${name}{${resolved}:#${colorValue}}`;
  });

  // Extract spacing
  const spacingMatches = content.match(jitPatterns.spacing);
  spacingMatches?.forEach((match) => {
    if (jitGenerated[match]) return;
    const [propName, propValue] = match.split(':');
    const name = `${propName}\\:${propValue.replace('%', '\\%')}`;
    const func = propsByShortNames[propName];
    const val = typeof func === 'function' ? func(propValue) : `${propName}:${propValue}`;
    jitGenerated[match] = `.${name}{${val}}`;
  });

  return Object.values(jitGenerated).join('\n');
}

// ─── Main Build Function ──────────────────────────────────────────────────────

function buildFromConfig(config) {
  try {
    const stylesResult = buildStyles(config.styles, config.useStaticNumbers);
    const colorsResult = buildColors(config.colors);
    const jitCSS = '';

    return {
      styles: stylesResult.css,
      themes: colorsResult.css,
      static: STATIC_CSS,
      jit: jitCSS,
      combined: `${stylesResult.css}\n${colorsResult.css}\n${STATIC_CSS}`,
      generatedClasses: { ...stylesResult.classes, ...colorsResult.classes },
      propsByShortNames: stylesResult.propsByShortNames,
      themeNames: colorsResult.themes || [],
    };
  } catch (e) {
    console.error('[MoonEngine] Build failed:', e);
    return { error: e.message, styles: '', themes: '', static: '', jit: '', combined: '', generatedClasses: {}, propsByShortNames: {}, themeNames: [] };
  }
}

// ─── Default Config ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  useStaticNumbers: false,
  useJit: true,
  projectDir: "src",
  content: ["src/**/*.{html,js,jsx,tsx}"],
  colors: {
    options: { "*": { opacities: [0.05, 0.25], props: ["bg", "text"] } },
    staticColors: { red: "#dd3643", cyan: "#63cfc9", nice: "#83d6e1", cute: "#a3e4cb", green: "#7bc74d" },
    themes: {
      light: { prim: "#FFFFFF", prince: "#f0f0f0", lord: "#909090", owl: "#1f1d2b", goat: "#c4c4c7" },
      dark: { prim: "#2d303e", prince: "#393c4a", lord: "#9099bc", owl: "#ffffff", goat: "#3c4f8d" },
      darker: { prim: "#0b132b", prince: "#1c2541", lord: "#3a506b", owl: "#5bc0be", goat: "#ffffff" },
    }
  },
  styles: [
    { props: { padding: "p", margin: "m", gap: "gap" }, variableName: "spacing", values: { "0": "0", xs: "2px", sm: "4px", md: "8px", lg: "10px", xl: "12px", "2x": "16px", "3x": "20px", "4x": "26px", "5x": "32px", "6x": "40px" } },
    { props: { width: "w", height: "h", size: "size" }, variableName: "size", values: { "0": "0", xs: "20px", sm: "40px", md: "80px", lg: "100px", xl: "120px", "2x": "160px", "3x": "200px", "4x": "260px", "5x": "320px", "6x": "400px" } },
    { props: { "font-size": "text" }, variableName: "text", values: { xs: "0.75rem", sm: "0.875rem", md: "1rem", lg: "1.125rem", xl: "1.25rem", "2x": "1.5rem", "3x": "1.875rem", "4x": "2.25rem" } },
    { props: { "border-radius": "round" }, variableName: "round", values: { none: "0px", sm: "4px", md: "8px", lg: "16px", xl: "24px", "2x": "32px", full: "999px" } },
    { props: { "box-shadow": "shadow" }, variableName: "shadow", values: { sm: "0 0 2px rgba(0,0,0,0.1)", md: "0 0 4px rgba(0,0,0,0.1)", lg: "0 0 8px rgba(0,0,0,0.2)", xl: "0 0 16px rgba(0,0,0,0.2)", none: "none" } },
    { props: { "border-width": "border" }, variableName: "border", values: { none: "0px", thin: "1px", thick: "2px" } },
    { props: { "border-style": "bs" }, variableName: "border-style", values: { none: "none", solid: "solid", dashed: "dashed", dotted: "dotted" } },
    { props: { transition: "transition" }, variableName: "transition", values: { none: "none", "200": "all 200ms ease-in-out", "300": "all 300ms ease-in-out", "500": "all 500ms ease-in-out" } },
    { props: { "font-weight": "weight" }, variableName: "weight", values: { normal: "400", bold: "700" } },
  ],
  screens: { xs: "0px", sm: "600px", md: "960px", lg: "1280px", xl: "1920px" }
};

// ─── Public API ───────────────────────────────────────────────────────────────
window.MoonEngine = { buildFromConfig, runJit, DEFAULT_CONFIG, hexToRGB };
})();
