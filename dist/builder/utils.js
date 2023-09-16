export const getPropsNames = (propName) => {
    return PropsByName[propName] ?? [{ name: (n) => `${n.replace("-", "")}`, css: (v) => `${propName}:${v}` }];
};
export const hexToRGB = (hex) => {
    if (hex.length === 4)
        hex = hex.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3");
    return hex.length === 7 ? `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}` : hex;
};
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
