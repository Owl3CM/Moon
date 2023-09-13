import { Controller } from "./controller.js";
import { getDefaultName, getPropsNames, getStaticCss, getColors } from "./utils.js";

let cssContent = "";
let useStaticNumbers = false;
export const getMoonCss = async () => {
  Controller.StylesVariables = [];
  const { colors, styles } = Controller.config;
  useStaticNumbers = Controller.config.useStaticNumbers ?? false;
  cssContent = "";

  cssContent += getColors(colors);
  cssContent += getStaticCss();
  styles.forEach(generateStyles);
  cssContent += `\n:root{\n${Controller.StylesVariables.join("\n")}\n}\n`;
  return cssContent;
};

const generateStyles = ({ props, values, variableName }: any) => {
  if (!props || !Object.keys(props).length) {
    Object.entries(values).forEach(([valueKey, valueValue]) => {
      const _variableName = `--${variableName ? variableName + "-" : ""}${valueKey}`;
      Controller.StylesVariables.push(`${_variableName}:${valueValue};`);
    });
    return;
  }
  Object.entries(values).forEach(([valueKey, valueValue]) => {
    const _variableName = `--${variableName ? variableName + "-" : ""}${valueKey}`;
    Controller.StylesVariables.push(`${_variableName}:${valueValue};`);
    const valueName = useStaticNumbers ? valueValue : `var(${_variableName})`;
    Object.entries(props).forEach(([prop, shortN]) => {
      const extraProps = getPropsNames(prop);
      const _shortN = shortN ?? getDefaultName(prop);
      extraProps.forEach(({ name, css }: any) => {
        const _name = name(_shortN);
        const dash = _name && valueKey ? "-" : "";
        const className = `.${_name}${dash}${valueKey}`;
        const classValue = css(valueName);
        cssContent += `${className}{${classValue};}`;
      });
    });
    cssContent += `\n`;
  });
};
