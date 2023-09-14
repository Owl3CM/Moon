import "../../moon/main.css";
import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import ToggleTheme from "./ToggleTheme";
import Moon from "../lib";

Moon.setTheme("dark");
createRoot(document.getElementById("root") as HTMLElement).render(
  <div className="">
    <div className="transition-slow bg-white hover[bg-green,text-white]">
      <p>tst</p>
    </div>
    <div className="bg-red md[bg-cyan,text-red,p-xl] transition-slow">
      <p>tst</p>
    </div>
    <div className="bg-red hover[bg-cyan,text-red,p-xl] transition-slow">
      <p>dkf</p>
    </div>
  </div>
);
// <BrowserRouter>
//   <App />
//   <ToggleTheme />
// </BrowserRouter>
