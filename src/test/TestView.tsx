import React from "react";
import { removeColors, setThemeVariables } from "..";
import { Moon } from "../lib";

type Props = {};
Moon.changeTheme("dark");

let dynimcVaribles: any = JSON.parse(localStorage.getItem("dynimcVaribles")) || {
  prim: "#2d303e",
  prince: "#393c4a",
  lord: "#9099bc",
  owl: "#ffffff",
  goat: "#9e9fa6",
};

setThemeVariables({ values: dynimcVaribles });

const TestView = (props: Props) => {
  const [theme, setTheme] = React.useState(Moon.currentTheme());
  return (
    <div className="inset-0 bg-prim col">
      <input type="color" onChange={(e) => setThemeVariables({ values: { prim: e.target.value } })} />

      <div className="row gap-2x bg-lord p-2x">
        {Object.entries(dynimcVaribles).map(([key, value]) => {
          return (
            <div className="col">
              <p>{key}</p>
              <input
                type="color"
                className="round-full size-sm overflow-hidden p-0"
                style={{
                  background: `var(--${key})`,
                  color: `var(--${key})`,
                }}
                defaultValue={value}
                onChange={(e) => {
                  dynimcVaribles[key] = e.target.value;
                  localStorage.setItem("dynimcVaribles", JSON.stringify(dynimcVaribles));
                  setThemeVariables({ values: dynimcVaribles });
                }}
              />
            </div>
          );
        })}
      </div>

      <div>
        <p
          onClick={() => {
            removeColors();
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
                Moon.changeTheme("dark");
                setTheme("dark");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              dark
            </p>
            <p
              onClick={() => {
                Moon.changeTheme("light");
                setTheme("light");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              light
            </p>
            <p
              onClick={() => {
                Moon.changeTheme("great");
                setTheme("great");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              great
            </p>
          </div>
          <p
            onClick={() => {
              const _currentTheme = Moon.currentTheme();
              if (_currentTheme === "dark") {
                Moon.changeTheme("light");
                setTheme("light");
              }
              if (_currentTheme === "light") {
                Moon.changeTheme("great");
                setTheme("great");
              }
              if (_currentTheme === "great") {
                Moon.changeTheme("dark");
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

const ColorPicker = ({ name = "", onChange }) => {
  return (
    <div className="col">
      <p>{name}</p>
      <input type="color" onChange={(e) => setThemeVariables({ values: { prim: e.target.value } })} />
    </div>
  );
};
