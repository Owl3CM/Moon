import { changeTheme, currentTheme } from "..";

type Props = {};

const TestView = (props: Props) => {
  return (
    <div className=" overflow-auto">
      <h1
        className=" text-owl bg-cyan"
        onClick={() => {
          changeTheme(currentTheme() === "light" ? "dark" : "light");
        }}>
        TestView
      </h1>
      <p className="border-cyan bg-owl border-thick p-xs">LOL</p>
    </div>
  );
};

export default TestView;
