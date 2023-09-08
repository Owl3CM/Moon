import { Controller } from "./controller.js";
import { getDefaultName, getPropsNames, getStaticCss, getThemes } from "./utils.js";
let cssContent = "";
const variables = [];
let useStaticNumbers = false;
export const getMoonCss = async () => {
    const { themes, styles } = Controller.config;
    useStaticNumbers = Controller.config.useStaticNumbers ?? false;
    cssContent = "";
    cssContent += getThemes(themes);
    cssContent += getStaticCss();
    styles.forEach(setup);
    cssContent += `\n:root{\n${variables.join("\n")}\n}\n`;
    return cssContent;
};
const setup = ({ props, values, variableName }) => {
    if (!props || !Object.keys(props).length) {
        Object.entries(values).forEach(([valueKey, valueValue]) => {
            const _variableName = `--${variableName ? variableName + "-" : ""}${valueKey}`;
            variables.push(`${_variableName}:${valueValue};`);
        });
        return;
    }
    Object.entries(values).forEach(([valueKey, valueValue]) => {
        const _variableName = `--${variableName ? variableName + "-" : ""}${valueKey}`;
        variables.push(`${_variableName}:${valueValue};`);
        const valueName = useStaticNumbers ? valueValue : `var(${_variableName})`;
        Object.entries(props).forEach(([prop, shortN]) => {
            const extraProps = getPropsNames(prop);
            const _shortN = shortN ?? getDefaultName(prop);
            extraProps.forEach(({ name, css }) => {
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
// const setup = ({ props, values }) => {
//   if (!props || !values) return;
//   Object.entries(props).forEach(([prop, shortN]) => {
//     cssContent += `\n`;
//     const extraProps = getPropsNames(prop);
//     const _shortN = shortN ?? getDefaultName(prop);
//     Object.entries(values).forEach(([valueKey, valueValue]) => {
//       extraProps.forEach(({ name, css }) => {
//         const _name = name(_shortN);
//         const dash = _name && valueKey ? "-" : "";
//         const className = `.${_name}${dash}${valueKey}`;
//         const classValue = css(valueValue);
//         cssContent += `${className}{${classValue};}`;
//       });
//       cssContent += `\n`;
//     });
//   });
// };
// const setup = ({ props, values }) => {
//   if (!props || !values) return;
//   Object.entries(props).forEach(([prop, shortN]) => {
//     const extraProps = getPropsNames(prop);
//     const _shortN = shortN ?? getDefaultName(prop);
//     extraProps.forEach(({ name, css }) => {
//       Object.entries(values).forEach(([valueKey, valueValue]) => {
//         const className = `.${name(_shortN)}${valueKey ? "-" + valueKey : ""}`;
//         const classValue = css(valueValue);
//         cssContent += `${className}{${classValue};}`;
//       });
//     });
//   });
//   cssContent += `\n`;
// };
