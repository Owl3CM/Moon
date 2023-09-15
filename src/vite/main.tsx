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
    <a
      href="/new"
      className="hover:border-blue-500 hover:border-solid hover:bg-white hover:text-blue-500 group w-full flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-sm leading-6 text-slate-900 font-medium py-3">
      <svg className="group-hover:text-blue-500 mb-1 text-slate-400" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1Z" />
      </svg>
      New project
    </a>
  </div>
);
// <BrowserRouter>
//   <App />
//   <ToggleTheme />
// </BrowserRouter>
