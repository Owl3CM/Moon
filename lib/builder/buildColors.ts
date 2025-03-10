import { Controller } from "./controller.js";
import { hexToRGB } from "./utils.js";

export const getColors = async () => {
  const colors = Controller.config.colors as ConfigColors;
  const { staticColors, themes } = colors;

  Controller.ColorsVariables = getAllColorsNamesVaribles(themes, staticColors);

  const root = Object.entries(staticColors).reduce((acc, [key, value]) => {
    const rgbKey = `rgb-${key}`;
    acc[rgbKey] = hexToRGB(value);
    acc[key] = `rgb(var(--${rgbKey}))`;
    return acc;
  }, {} as any);

  Object.keys(themes).forEach((key) => {
    const _Theme = themes[key];
    const rgbTheme = {};
    Object.entries(_Theme).forEach(([cK, hex]) => {
      rgbTheme[`rgb-${cK}`] = hexToRGB(hex);
      root[`${cK}`] = `rgb(var(--rgb-${cK}))`;
    });
    themes[key] = rgbTheme;
  });

  const options = handleOptions(colors.options);

  Object.entries(options).forEach(([colorName, { opacities }]) => {
    if (!opacities) return;
    appendTheGeneratedOpacitiesToTheStaticColors(opacities, colorName, root, options);
  });

  const themesContent = Object.entries({ root: root, ...themes })
    .map(
      ([themeKey, themeValues]) =>
        `${themeKey === "root" ? ":" : "."}${themeKey}{${Object.entries(themeValues)
          .map(([key, value]) => `--${key}:${value};`)
          .join("")}}`,
    )
    .join("\n");

  let colorsContent = "/*classes*/\n";

  Object.entries(root).forEach(([key, value]) => {
    const _colorsProps = options[key]?.props ?? defaultsProps;
    if (key.startsWith("rgb-")) return;
    _colorsProps?.forEach((propKey) => {
      const _class = `${propKey}-${key}`;
      const variable = `--${key}`;
      const classValue = `${colorsKeys[propKey]}:var(${variable})`;
      colorsContent += `.${_class}{${classValue};} `;
      Controller.GeneratedClasses[_class] = classValue;
    });
    colorsContent += `\n`;
  });

  return `/* This file is generated by Moon Style. Do not edit it manually. */
${themesContent}\n\n${colorsContent}`;
};
const colorsKeys = {
  bg: "background-color",
  text: "color",
  fill: "fill",
  border: "border-color",
  stroke: "stroke",
};

const getAllColorsNamesVaribles = (themes: { [key: string]: { [key: string]: string } }, staticColors: { [key: string]: string }) =>
  [
    ...Object.values(themes)
      .map((v) => Object.keys(v))
      .flat(),
    ...Object.keys(staticColors),
  ].filter((v, i, a) => a.indexOf(v) === i);

function appendTheGeneratedOpacitiesToTheStaticColors(
  opacities: any,
  key: string,
  staticColors: { [key: string]: string },
  options: { [key: string]: { props?: string[] | undefined; opacities?: number[] | undefined } },
) {
  opacities.forEach((value: any) => {
    const colorWithOpacity = `${key}-${value * 1000}`;
    staticColors[colorWithOpacity] = `rgba(var(--rgb-${key}),${value})`;
    if (options[colorWithOpacity] || !options[key]) return;
    options[colorWithOpacity] = { props: options[key]?.props };
  });
}

let defaultsProps = ["bg", "text", "fill", "border"];
function handleOptions(options: { [key: string]: { props?: string[] | undefined; opacities?: number[] | undefined } }) {
  if (!options) return {};
  let { opacities, props } = options["*"];
  if (props) defaultsProps = props;

  Controller.ColorsVariables.forEach((key) => {
    if (!options[key]) options[key] = { opacities };
    else if (!options[key].opacities) options[key].opacities = opacities;
  });
  delete options["*"];
  return options;
}

type ConfigColors = {
  options: {
    [key: string]: {
      props?: string[];
      opacities?: number[];
    };
  };
  staticColors: {
    [key: string]: string;
  };
  themes: {
    [key: string]: {
      [key: string]: string;
    };
  };
};
