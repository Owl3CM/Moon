import { Controller } from "./controller.js";
import { getDefaultName, getPropsNames } from "./utils.js";

let cssContent = "";
let useStaticNumbers = false;
export const getStyles = async () => {
  Controller.StylesVariables = [];
  const { styles } = Controller.config;
  useStaticNumbers = Controller.config.useStaticNumbers ?? false;
  cssContent = "";
  styles.forEach(generateStyles);
  return `/* This file is generated by Moon Style. Do not edit it manually. */
  :root{\n${Controller.StylesVariables.join("\n")}\n}\n ${cssContent}`;
};

const generateStyles = ({ props, values, variableName }: any) => {
  if (!props || !Object.keys(props).length) {
    Object.entries(values).forEach(([valueKey, valueValue]) => {
      const _variableName = `--${variableName ? variableName + "-" : ""}${valueKey}`;
      Controller.StylesVariables.push(`${_variableName}:${valueValue};`);
    });
    return;
  }
  Object.entries(values).forEach(([shortName, proprty]) => {
    const _variableName = `--${variableName ? variableName + "-" : ""}${shortName}`;
    Controller.StylesVariables.push(`${_variableName}:${proprty};`);
    const valueName = useStaticNumbers ? proprty : `var(${_variableName})`;
    Object.entries(props).forEach(([prop, shortN]) => {
      const extraProps = getPropsNames(prop);
      const _shortN = shortN ?? getDefaultName(prop);
      extraProps.forEach(({ name, css }: any) => {
        const _name = name(_shortN);
        Controller.PropsByShourtNames[_name] = css;
        const dash = _name && shortName ? "-" : "";
        const className = `${_name}${dash}${shortName}`;
        const classValue = css(valueName);
        Controller.GeneratedClasses[className] = classValue;
        cssContent += `.${className}{${classValue};}`;
      });
    });
    cssContent += `\n`;
  });
};

const addExtraProps = (propName, shortKey) => {
  return {
    padding: {
      [shortKey]: "padding",
      [`${shortKey}r`]: "padding-right",
      [`${shortKey}l`]: "padding-left",
      [`${shortKey}t`]: "padding-top",
      [`${shortKey}b`]: "padding-bottom",
      [`${shortKey}x`]: "padding-inline",
      [`${shortKey}y`]: "padding-block",
      [`${shortKey}s`]: "padding-inline-start",
      [`${shortKey}e`]: "padding-inline-end",
    },
    margin: {
      [shortKey]: "margin",
      [`${shortKey}r`]: "margin-right",
      [`${shortKey}l`]: "margin-left",
      [`${shortKey}t`]: "margin-top",
      [`${shortKey}b`]: "margin-bottom",
      [`${shortKey}x`]: "margin-inline",
      [`${shortKey}y`]: "margin-block",
      [`${shortKey}s`]: "margin-inline-start",
      [`${shortKey}e`]: "margin-inline-end",
    },
    width: { [shortKey]: "width", [`min-${shortKey}`]: "min-width", [`max-${shortKey}`]: "max-width" },
    height: { [shortKey]: "height", [`min-${shortKey}`]: "min-height", [`max-${shortKey}`]: "max-height" },
    border: {
      [shortKey]: "border",
      [`${shortKey}-t`]: "border-top",
      [`${shortKey}-r`]: "border-right",
      [`${shortKey}-b`]: "border-bottom",
      [`${shortKey}-l`]: "border-left",
      [`${shortKey}-x`]: "border-inline",
      [`${shortKey}-y`]: "border-block",
      [`${shortKey}-s`]: "border-inline-start",
      [`${shortKey}-e`]: "border-inline-end",
    },
    "border-width": {
      [shortKey]: "border-width",
      [`${shortKey}-t`]: "border-top-width",
      [`${shortKey}-r`]: "border-right-width",
      [`${shortKey}-b`]: "border-bottom-width",
      [`${shortKey}-l`]: "border-left-width",
      [`${shortKey}-x`]: "border-inline-width",
      [`${shortKey}-y`]: "border-block-width",
      [`${shortKey}-s`]: "border-inline-start-width",
      [`${shortKey}-e`]: "border-inline-end-width",
    },

    "border-radius": {
      [shortKey]: "border-radius",
      [`${shortKey}-t`]: "border-top-left-radius",
      [`${shortKey}-r`]: "border-top-right-radius",
      [`${shortKey}-b`]: "border-bottom-right-radius",
      [`${shortKey}-l`]: "border-bottom-left-radius",
      [`${shortKey}-tl`]: "border-top-left-radius",
      [`${shortKey}-tr`]: "border-top-right-radius",
      [`${shortKey}-br`]: "border-bottom-right-radius",
      [`${shortKey}-bl`]: "border-bottom-left-radius",
    },
  }[propName];
};
