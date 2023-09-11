import React from "react";
import { Moon } from "../lib";
import { Theme } from "../../Moon.Types";

Moon.setTheme("dark");

let dynimcColors: any = {
  prim: "#0b132b",
  prince: "#1c2541",
  lord: "#3a506b",
  owl: "#5bc0be",
  goat: "#ffffff",
};

Moon.setColors(dynimcColors);
const themes: Theme[] = ["dark", "light"];

const TestViewSecond = () => {
  const [theme, setTheme] = React.useState(Moon.currentTheme || "dynamic");
  return (
    <div className="inset-0 fixed bg-prim col">
      <div className="bg-prince round-xl p-lg shadow-lg size-5x m-auto ">
        <span className="text-goat-500">SVG</span>
        <div className="m-auto col items-center p-xl font-mono">
          <div className="row gap-2x bg-lord p-2x round-lg">
            {Object.entries(dynimcColors).map(([key, value]) => {
              return <ColorPicker key={key} name={key} value={value} />;
            })}
          </div>
          <span className="text-goat-200">SVG</span>
          <svg className="size-md" viewBox="0 0 24 24" fill="none">
            <path
              className="fill-owl"
              d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            />
          </svg>
          <p className="border-thick border-solid border-owl round-md px-md py-sm text-owl">Border</p>
          <div className="row gap-lg bg-lord round-lg px-xl">
            {themes.map((item, index) => {
              return (
                <p
                  key={index}
                  onClick={() => {
                    Moon.setTheme(item);
                    setTheme(item);
                  }}
                  style={{
                    border: `5px solid ${item === theme ? "var(--owl)" : "var(--prince)"}`,
                  }}
                  className="pointer bg-prince text-owl py-lg px-xl round-lg text-x shadow-lg">
                  {item}
                </p>
              );
            })}
            <p
              onClick={() => {
                Moon.setColors(dynimcColors);
                setTheme("dynamic");
              }}
              style={{
                border: `5px solid ${theme === "dynamic" ? "var(--owl)" : "var(--prince)"}`,
              }}
              className="pointer bg-prince text-owl py-lg px-xl round-lg text-x shadow-lg">
              dynamic
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestViewSecond;

const ColorPicker = ({ name = "", value }) => {
  const ref = React.useRef(null);
  return (
    <div className="col-center font-mono text-goat">
      <p className="text-center text-sm m-auto">{name}</p>
      <input
        ref={ref}
        type="color"
        className="opacity-0 h-0"
        defaultValue={value as any}
        onChange={(e) => {
          dynimcColors[name] = e.target.value;
          Moon.setColor(name as any, e.target.value);
        }}
      />
      <p
        onClick={() => {
          (ref as any).current.click();
        }}
        className={`size-xs round-full border-thin border-solid pointer m-auto bg-${name}`}
        style={{ backgroundColor: value }}
      />
    </div>
  );
};
