import React from "react";
import { changeTheme, currentTheme } from "..";

type Props = {};
changeTheme("dark");
const TestView = (props: Props) => {
  const [theme, setTheme] = React.useState(currentTheme());
  return (
    <div className="inset-0 bg-prim col">
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
                changeTheme("dark");
                setTheme("dark");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              dark
            </p>
            <p
              onClick={() => {
                changeTheme("light");
                setTheme("light");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              light
            </p>
            <p
              onClick={() => {
                changeTheme("great");
                setTheme("great");
              }}
              className="pointer bg-lord text-white py-lg px-xl round-lg text-x shadow-lg">
              great
            </p>
          </div>
          <p
            onClick={() => {
              const _currentTheme = currentTheme();
              if (_currentTheme === "dark") {
                changeTheme("light");
                setTheme("light");
              }
              if (_currentTheme === "light") {
                changeTheme("great");
                setTheme("great");
              }
              if (_currentTheme === "great") {
                changeTheme("dark");
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
