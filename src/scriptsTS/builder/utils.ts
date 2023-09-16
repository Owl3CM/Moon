export const getPropsNames = (propName: string) => {
  return PropsByName[propName] ?? [{ name: (n: any) => `${n.replace("-", "")}`, css: (v: any) => `${propName}:${v}` }];
};
export const hexToRGB = (hex: string) => {
  if (hex.length === 4) hex = hex.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3");
  return hex.length === 7 ? `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}` : hex;
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
