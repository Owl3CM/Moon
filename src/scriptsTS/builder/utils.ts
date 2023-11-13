export const getPropsNames = (propName: string) => {
  return PropsByName[propName] ?? [{ name: (n: any) => `${n}`, css: (v: any) => `${propName}:${v}` }];
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
    { name: (n: any) => `${n}`, css: (v: any) => `padding:${v}` },
    { name: (n: any) => `${n}r`, css: (v: any) => `padding-right:${v}` },
    { name: (n: any) => `${n}l`, css: (v: any) => `padding-left:${v}` },
    { name: (n: any) => `${n}t`, css: (v: any) => `padding-top:${v}` },
    { name: (n: any) => `${n}b`, css: (v: any) => `padding-bottom:${v}` },
    { name: (n: any) => `${n}x`, css: (v: any) => `padding-inline:${v}` },
    { name: (n: any) => `${n}y`, css: (v: any) => `padding-block:${v}` },
    { name: (n: any) => `${n}s`, css: (v: any) => `padding-inline-start:${v}` },
    { name: (n: any) => `${n}e`, css: (v: any) => `padding-inline-end:${v}` },
  ],
  margin: [
    { name: (n: any) => `${n}`, css: (v: any) => `margin:${v}` },
    { name: (n: any) => `${n}r`, css: (v: any) => `margin-right:${v}` },
    { name: (n: any) => `${n}l`, css: (v: any) => `margin-left:${v}` },
    { name: (n: any) => `${n}t`, css: (v: any) => `margin-top:${v}` },
    { name: (n: any) => `${n}b`, css: (v: any) => `margin-bottom:${v}` },
    { name: (n: any) => `${n}x`, css: (v: any) => `margin-inline:${v}` },
    { name: (n: any) => `${n}y`, css: (v: any) => `margin-block:${v}` },
    { name: (n: any) => `${n}s`, css: (v: any) => `margin-inline-start:${v}` },
    { name: (n: any) => `${n}e`, css: (v: any) => `margin-inline-end:${v}` },
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
    { name: (n: any) => n, css: (v: any) => `border:${v}` },
    { name: (n: any) => `${n}-t`, css: (v: any) => `border-top:${v}` },
    { name: (n: any) => `${n}-r`, css: (v: any) => `border-right:${v}` },
    { name: (n: any) => `${n}-b`, css: (v: any) => `border-bottom:${v}` },
    { name: (n: any) => `${n}-l`, css: (v: any) => `border-left:${v}` },
    { name: (n: any) => `${n}-x`, css: (v: any) => `border-inline:${v}` },
    { name: (n: any) => `${n}-y`, css: (v: any) => `border-block:${v}` },
    { name: (n: any) => `${n}-s`, css: (v: any) => `border-inline-start:${v}` },
    { name: (n: any) => `${n}-e`, css: (v: any) => `border-inline-end:${v}` },
  ],
  "border-width": [
    { name: (n: any) => n, css: (v: any) => `border-width:${v}` },
    { name: (n: any) => `${n}-t`, css: (v: any) => `border-top-width:${v}` },
    { name: (n: any) => `${n}-r`, css: (v: any) => `border-right-width:${v}` },
    { name: (n: any) => `${n}-b`, css: (v: any) => `border-bottom-width:${v}` },
    { name: (n: any) => `${n}-l`, css: (v: any) => `border-left-width:${v}` },
    { name: (n: any) => `${n}-x`, css: (v: any) => `border-inline-width:${v}` },
    { name: (n: any) => `${n}-y`, css: (v: any) => `border-block-width:${v}` },
    { name: (n: any) => `${n}-s`, css: (v: any) => `border-inline-start-width:${v}` },
    { name: (n: any) => `${n}-e`, css: (v: any) => `border-inline-end-width:${v}` },
  ],
  "border-radius": [
    { name: (n: any) => n, css: (v: any) => `border-radius:${v}` },
    { name: (n: any) => `${n}-t`, css: (v: any) => `border-top-left-radius:${v};border-top-right-radius:${v}` },
    { name: (n: any) => `${n}-r`, css: (v: any) => `border-top-right-radius:${v};border-bottom-right-radius:${v}` },
    { name: (n: any) => `${n}-b`, css: (v: any) => `border-bottom-right-radius:${v};border-bottom-left-radius:${v}` },
    { name: (n: any) => `${n}-l`, css: (v: any) => `border-top-left-radius:${v};border-bottom-left-radius:${v}` },
    { name: (n: any) => `${n}-tl`, css: (v: any) => `border-top-left-radius:${v}` },
    { name: (n: any) => `${n}-tr`, css: (v: any) => `border-top-right-radius:${v}` },
    { name: (n: any) => `${n}-br`, css: (v: any) => `border-bottom-right-radius:${v}` },
    { name: (n: any) => `${n}-bl`, css: (v: any) => `border-bottom-left-radius:${v}` },
    { name: (n: any) => `${n}-s`, css: (v: any) => `border-start-start-radius:${v};border-start-end-radius:${v}` },
    { name: (n: any) => `${n}-e`, css: (v: any) => `border-end-start-radius:${v};border-end-end-radius:${v}` },
  ],
  blur: [{ name: (n: any) => n, css: (v: any) => `filter:blur(${v})` }],
  "backdrop-blur": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:blur(${v})` }],
  "box-shadow": [{ name: (n: any) => n, css: (v: any) => `box-shadow:${v}` }],
  "font-size": [{ name: (n: any) => n, css: (v: any) => `font-size:${v}` }],
  "line-height": [{ name: (n: any) => n, css: (v: any) => `line-height:${v}` }],
  "letter-spacing": [{ name: (n: any) => n, css: (v: any) => `letter-spacing:${v}` }],
  "font-weight": [{ name: (n: any) => n, css: (v: any) => `font-weight:${v}` }],
  "font-family": [{ name: (n: any) => n, css: (v: any) => `font-family:${v}` }],
  "text-transform": [{ name: (n: any) => n, css: (v: any) => `text-transform:${v}` }],
  "text-decoration": [{ name: (n: any) => n, css: (v: any) => `text-decoration:${v}` }],
  "text-align": [{ name: (n: any) => n, css: (v: any) => `text-align:${v}` }],
  "vertical-align": [{ name: (n: any) => n, css: (v: any) => `vertical-align:${v}` }],
  "white-space": [{ name: (n: any) => n, css: (v: any) => `white-space:${v}` }],
  "word-break": [{ name: (n: any) => n, css: (v: any) => `word-break:${v}` }],
  "word-wrap": [{ name: (n: any) => n, css: (v: any) => `word-wrap:${v}` }],
  "text-overflow": [{ name: (n: any) => n, css: (v: any) => `text-overflow:${v}` }],
  "overflow-wrap": [{ name: (n: any) => n, css: (v: any) => `overflow-wrap:${v}` }],
  "background-color": [{ name: (n: any) => n, css: (v: any) => `background-color:${v}` }],
  color: [{ name: (n: any) => n, css: (v: any) => `color:${v}` }],
  opacity: [{ name: (n: any) => n, css: (v: any) => `opacity:${v}` }],
  "z-index": [{ name: (n: any) => n, css: (v: any) => `z-index:${v}` }],
  "box-sizing": [{ name: (n: any) => n, css: (v: any) => `box-sizing:${v}` }],
  "flex-direction": [{ name: (n: any) => n, css: (v: any) => `flex-direction:${v}` }],
  "flex-wrap": [{ name: (n: any) => n, css: (v: any) => `flex-wrap:${v}` }],
  "flex-flow": [{ name: (n: any) => n, css: (v: any) => `flex-flow:${v}` }],
  "justify-content": [{ name: (n: any) => n, css: (v: any) => `justify-content:${v}` }],
  "align-items": [{ name: (n: any) => n, css: (v: any) => `align-items:${v}` }],
  "align-content": [{ name: (n: any) => n, css: (v: any) => `align-content:${v}` }],
  "align-self": [{ name: (n: any) => n, css: (v: any) => `align-self:${v}` }],
  "place-content": [{ name: (n: any) => n, css: (v: any) => `place-content:${v}` }],
  "place-items": [{ name: (n: any) => n, css: (v: any) => `place-items:${v}` }],
  "place-self": [{ name: (n: any) => n, css: (v: any) => `place-self:${v}` }],
  gap: [{ name: (n: any) => n, css: (v: any) => `gap:${v}` }],
  inset: [{ name: (n: any) => n, css: (v: any) => `inset:${v}` }],
  top: [{ name: (n: any) => n, css: (v: any) => `top:${v}` }],
  left: [{ name: (n: any) => n, css: (v: any) => `left:${v}` }],
  right: [{ name: (n: any) => n, css: (v: any) => `right:${v}` }],
  bottom: [{ name: (n: any) => n, css: (v: any) => `bottom:${v}` }],
  transform: [{ name: (n: any) => n, css: (v: any) => `transform:${v}` }],
  "transform-origin": [{ name: (n: any) => n, css: (v: any) => `transform-origin:${v}` }],
  transition: [{ name: (n: any) => n, css: (v: any) => `transition:${v}` }],
  "transition-property": [{ name: (n: any) => n, css: (v: any) => `transition-property:${v}` }],

  content: [{ name: (n: any) => n, css: (v: any) => `content:${v}` }],
  "counter-reset": [{ name: (n: any) => n, css: (v: any) => `counter-reset:${v}` }],
  "counter-increment": [{ name: (n: any) => n, css: (v: any) => `counter-increment:${v}` }],

  "grid-template-columns": [{ name: (n: any) => n, css: (v: any) => `grid-template-columns:${v}` }],
  "grid-template-rows": [{ name: (n: any) => n, css: (v: any) => `grid-template-rows:${v}` }],
  "grid-template-areas": [{ name: (n: any) => n, css: (v: any) => `grid-template-areas:${v}` }],
  "grid-template": [{ name: (n: any) => n, css: (v: any) => `grid-template:${v}` }],
  "grid-auto-columns": [{ name: (n: any) => n, css: (v: any) => `grid-auto-columns:${v}` }],

  "grid-auto-rows": [{ name: (n: any) => n, css: (v: any) => `grid-auto-rows:${v}` }],
  "grid-auto-flow": [{ name: (n: any) => n, css: (v: any) => `grid-auto-flow:${v}` }],
  grid: [{ name: (n: any) => n, css: (v: any) => `grid:${v}` }],
  "grid-column-start": [{ name: (n: any) => n, css: (v: any) => `grid-column-start:${v}` }],
  "grid-column-end": [{ name: (n: any) => n, css: (v: any) => `grid-column-end:${v}` }],
  "grid-row-start": [{ name: (n: any) => n, css: (v: any) => `grid-row-start:${v}` }],
  "grid-row-end": [{ name: (n: any) => n, css: (v: any) => `grid-row-end:${v}` }],
  "grid-column": [{ name: (n: any) => n, css: (v: any) => `grid-column:${v}` }],
  "grid-row": [{ name: (n: any) => n, css: (v: any) => `grid-row:${v}` }],
  "grid-area": [{ name: (n: any) => n, css: (v: any) => `grid-area:${v}` }],

  "justify-items": [{ name: (n: any) => n, css: (v: any) => `justify-items:${v}` }],
  "justify-self": [{ name: (n: any) => n, css: (v: any) => `justify-self:${v}` }],

  brightness: [{ name: (n: any) => n, css: (v: any) => `filter:brightness(${v})` }],
  contrast: [{ name: (n: any) => n, css: (v: any) => `filter:contrast(${v})` }],
  grayscale: [{ name: (n: any) => n, css: (v: any) => `filter:grayscale(${v})` }],
  "hue-rotate": [{ name: (n: any) => n, css: (v: any) => `filter:hue-rotate(${v})` }],
  invert: [{ name: (n: any) => n, css: (v: any) => `filter:invert(${v})` }],
  saturate: [{ name: (n: any) => n, css: (v: any) => `filter:saturate(${v})` }],
  sepia: [{ name: (n: any) => n, css: (v: any) => `filter:sepia(${v})` }],
  "drop-shadow": [{ name: (n: any) => n, css: (v: any) => `filter:drop-shadow(${v})` }],
  "backdrop-filter": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:${v}` }],
  "backdrop-brightness": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:brightness(${v})` }],
  "backdrop-contrast": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:contrast(${v})` }],
  "backdrop-grayscale": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:grayscale(${v})` }],
  "backdrop-hue-rotate": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:hue-rotate(${v})` }],
  "backdrop-invert": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:invert(${v})` }],
  "backdrop-saturate": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:saturate(${v})` }],
  "backdrop-sepia": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:sepia(${v})` }],
  "backdrop-drop-shadow": [{ name: (n: any) => n, css: (v: any) => `backdrop-filter:drop-shadow(${v})` }],

  "scrollbar-width": [{ name: (n: any) => n, css: (v: any) => `scrollbar-width:${v}` }],
  "scrollbar-color": [{ name: (n: any) => n, css: (v: any) => `scrollbar-color:${v}` }],
  "scrollbar-track-color": [{ name: (n: any) => n, css: (v: any) => `scrollbar-track-color:${v}` }],
  "scrollbar-thumb-color": [{ name: (n: any) => n, css: (v: any) => `scrollbar-thumb-color:${v}` }],
  "scrollbar-thumb-width": [{ name: (n: any) => n, css: (v: any) => `scrollbar-thumb-width:${v}` }],
  "scrollbar-thumb-height": [{ name: (n: any) => n, css: (v: any) => `scrollbar-thumb-height:${v}` }],
  "scrollbar-thumb-radius": [{ name: (n: any) => n, css: (v: any) => `scrollbar-thumb-radius:${v}` }],
  "scrollbar-thumb-background": [{ name: (n: any) => n, css: (v: any) => `scrollbar-thumb-background:${v}` }],

  animation: [{ name: (n: any) => n, css: (v: any) => `animation:${v}` }],
  "animation-name": [{ name: (n: any) => n, css: (v: any) => `animation-name:${v}` }],
  "animation-duration": [{ name: (n: any) => n, css: (v: any) => `animation-duration:${v}` }],
  "animation-timing-function": [{ name: (n: any) => n, css: (v: any) => `animation-timing-function:${v}` }],
  "animation-delay": [{ name: (n: any) => n, css: (v: any) => `animation-delay:${v}` }],
  "animation-iteration-count": [{ name: (n: any) => n, css: (v: any) => `animation-iteration-count:${v}` }],
  "animation-direction": [{ name: (n: any) => n, css: (v: any) => `animation-direction:${v}` }],
  "animation-fill-mode": [{ name: (n: any) => n, css: (v: any) => `animation-fill-mode:${v}` }],
  "animation-play-state": [{ name: (n: any) => n, css: (v: any) => `animation-play-state:${v}` }],
  "animation-timeline": [{ name: (n: any) => n, css: (v: any) => `animation-timeline:${v}` }],
  "animation-frames": [{ name: (n: any) => n, css: (v: any) => `animation-frames:${v}` }],
  "animation-frames-name": [{ name: (n: any) => n, css: (v: any) => `animation-frames-name:${v}` }],
  "animation-frames-duration": [{ name: (n: any) => n, css: (v: any) => `animation-frames-duration:${v}` }],
  "animation-frames-timing-function": [{ name: (n: any) => n, css: (v: any) => `animation-frames-timing-function:${v}` }],
  "animation-frames-delay": [{ name: (n: any) => n, css: (v: any) => `animation-frames-delay:${v}` }],

  "transition-duration": [{ name: (n: any) => n, css: (v: any) => `transition-duration:${v}` }],
  "transition-timing-function": [{ name: (n: any) => n, css: (v: any) => `transition-timing-function:${v}` }],
  "transition-delay": [{ name: (n: any) => n, css: (v: any) => `transition-delay:${v}` }],
} as any;

export const funcPerformance = async (func: Function, args: any[]) => {
  const start = performance.now();
  await func(...args);
  const end = performance.now();
  console.log(`${func.name}: ${(end - start).toString().slice(0, 4)} ms`);
};
