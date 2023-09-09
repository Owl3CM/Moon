import React from "react";
import { Moon } from "../lib";
import { Theme } from "../../Moon.Types";

Moon.setTheme("dark");

const themes: Theme[] = ["dark", "light", "darker", "LOL", "bad"];

const TestView = () => {
  const [theme, setTheme] = React.useState(Moon.currentTheme);
  return (
    <div className="inset-0 fixed bg-prim col">
      <div className="bg-prince round-xl p-md shadow-lg size-5x m-auto">
        <div className="m-auto col items-center p-xl font-mono">
          <span className="text-owl">SVG</span>
          <svg className="size-md" viewBox="0 0 24 24" fill="none">
            <path
              className="fill-owl"
              d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            />
          </svg>
          <p className="border-thick border-solid border-owl round-md p-md text-owl">Border</p>
          <div className="row gap-lg bg-lord round-xl p-xl">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestView;
