import React from "react";
import { Route, Routes } from "react-router-dom";
import TestView from "./TestView";
import { Link } from "react-router-dom";
import TestViewSecond from "./TestViewSecond";

const _TestRoutes = [
  {
    //
    path: "/",
    Component: TestView,
    title: "home",
  },
  {
    //
    path: "/second",
    Component: TestViewSecond,
    title: "second",
  },
];
const TestRoutes = () => {
  return (
    <>
      <Routes>
        {_TestRoutes.map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>

      <div className="fixed bottom-0 active:[bg:#fff] left-0 right-0 row-center overflow-auto justify-center gap-xl bg-prim p-sm">
        {_TestRoutes.map(({ path, title }) => (
          <Link
            className="button"
            key={path}
            to={path}
            style={{
              backgroundColor: window.location.pathname === path ? "var(--purple)" : "var(--king",
            }}
            onClick={({ currentTarget }) => {
              currentTarget.parentElement?.querySelectorAll("a").forEach((a) => {
                a.style.backgroundColor = a === currentTarget ? "var(--purple)" : "var(--king)";
              });
            }}>
            {title}
          </Link>
        ))}
      </div>
    </>
  );
};

export default TestRoutes;
