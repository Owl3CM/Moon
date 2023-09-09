import React from "react";
import { Moon } from "../lib";

type Props = {};
Moon.setTheme("dark");

let dynimcVaribles: any = JSON.parse(localStorage.getItem("dynimcVaribles")) || {
  prim: "#2d303e",
  prince: "#393c4a",
  lord: "#9099bc",
  owl: "#ffffff",
  goat: "#9e9fa6",
};

Moon.setColors(dynimcVaribles);

const TestView = (props: Props) => {
  const [theme, setTheme] = React.useState(Moon.currentTheme);
  return (
    <div className="inset-0 fixed bg-prim col">
      <div className="row gap-2x bg-lord p-2x">
        {Object.entries(dynimcVaribles).map(([key, value]) => {
          return <ColorPicker key={key} name={key} value={value} />;
        })}
      </div>

      <div>
        <p
          onClick={() => {
            Moon.removeColors();
          }}>
          remove dynmic
        </p>
      </div>
      <div className="bg-prince round-xl p-md shadow-lg size-6x m-auto ">
        <div className="m-auto col items-center p-xl font-mono">
          <p className="text-owl bg-prim round-lg p-xl text-xl text-center">
            Current Theme is <span className="text-nice px-xl">{theme}</span>
          </p>
          <p className="text-owl bg-prim round-lg p-xl text-xl text-center">
            You can change the
            <span className="text-shark px-xl">theme</span>
            by clicking the
            <span className="text-owl px-xl">buttons</span>
            below.
          </p>
          <p className="border-thin border-solid border-lord round-md p-md text-lord">border</p>
          <div className="row gap-lg bg-prim round-xl p-xl">
            <p
              onClick={() => {
                Moon.setTheme("dark");
                setTheme("dark");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              dark
            </p>
            <p
              onClick={() => {
                Moon.setTheme("light");
                setTheme("light");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              light
            </p>
            <p
              onClick={() => {
                Moon.setTheme("great");
                setTheme("great");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              great
            </p>
          </div>
          <p
            onClick={() => {
              const _currentTheme = Moon.currentTheme;
              if (_currentTheme === "dark") {
                Moon.setTheme("light");
                setTheme("light");
              }
              if (_currentTheme === "light") {
                Moon.setTheme("great");
                setTheme("great");
              }
              if (_currentTheme === "great") {
                Moon.setTheme("dark");
                setTheme("dark");
              }
            }}
            className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
            Toggle Theme
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestView;

const ColorPicker = ({ name = "", value }) => {
  const ref = React.useRef(null);
  return (
    <div className="col-center font-mono">
      <p className="text-center text-sm m-auto">{name}</p>
      <input
        ref={ref}
        type="color"
        className="display-none"
        defaultValue={value as any}
        onChange={(e) => {
          dynimcVaribles[name] = e.target.value;
          localStorage.setItem("dynimcVaribles", JSON.stringify(dynimcVaribles));
          Moon.setColor(name as any, e.target.value);
        }}
      />
      <p
        onClick={() => {
          (ref as any).current.click();
        }}
        className="size-xs round-md border-t-thin border-solid pointer m-auto"
        style={{ backgroundColor: value }}
      />
    </div>
  );
};
