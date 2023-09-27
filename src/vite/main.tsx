import "../../moon/main.css";
import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import ToggleTheme from "./ToggleTheme";
import Moon from "../index";

Moon.setTheme("dark");
createRoot(document.getElementById("root") as HTMLElement).render(
  <div className="phone:hover:[bg-red,w:100px]">
    <div className="transition-300 bg-white p-xs active:[bg-red,p-lg]">
      <p className="custom:[text:uppercase]">actions</p>
    </div>
    <p className="border-right-color:#ff0 border:2px solid p:100px after:[text-cyan,h:100px,w:100px,bg-red,round-full,display:block]">wtf</p>
    <p className="test transition-400 bg-green lg:[h:10%,text:#f00,bg:#ff0,border:#0af,m:100px,p:100px,border-solid]">test</p>
    <button
      onClick={({ currentTarget }) => {
        currentTarget.setAttribute("disabled", "true");
      }}
      className="transition-300 bg-white p-xs active:hover:[bg-red,p-xl] p:10px">
      lol
    </button>
    <div className="transition-300 bg-white p-xs active:[bg-red,p-lg]">
      <p>actions</p>
    </div>
    <div className="backdrop-blur-sm inset-0 fixed">
      <p>blur</p>
    </div>
  </div>
);
// <BrowserRouter>
//   <App />
//   <ToggleTheme />
// </BrowserRouter>
