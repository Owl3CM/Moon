import React from "react";
import Moon from "../index";
import { Theme } from "../../Moon.Types";

Moon.setTheme("dark");

const themes: Theme[] = ["dark", "light", "darker", "LOL", "bad"];

const TestView = () => {
  const [theme, setTheme] = React.useState(Moon.currentTheme);
  return (
    <div className="inset-0 fixed bg-prim col bg-gree">
      <div className="bg-prince round-xl p-md shadow-lg size-5x m-auto relative">
        <div className="m-auto col items-center p-xl font-mono">
          <span className="bg-lord-900 p-xl">SVG</span>
          <span className="text-owl">SVG</span>
          <svg className="size-md absolute top-0 left-0 opacity-20" viewBox="0 0 24 24" fill="none">
            <path
              className="fill-owl"
              d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            />
          </svg>
          <Svg />
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

export const Svg = () => (
  <svg viewBox="0 0 512 512" className="size-2x rotate">
    <path
      className="fill-lord"
      d="M426.655,444.491c-85.064,74.278-206.9,83.839-299.319,29.581
			c-22.308-13.074-42.982-29.907-60.958-50.499C56,411.723,46.93,399.058,39.085,385.82C15.143,345.045,3.539,298.958,3.784,252.953
			c0.49-71.582,29.989-142.754,87.026-192.6C138.776,18.433,197.855-1.096,256.69,0.047c45.597,0.817,91.03,13.973,131.069,38.733
			c22.063,13.564,42.41,30.724,60.305,51.153c9.724,11.114,18.386,22.799,25.822,34.974
			C537.623,227.785,521.117,361.878,426.655,444.491z"
    />
    <path
      className="fill-goat"
      d="M107.7,89.244c99.915-87.35,248.817-74.175,333.815,23.051
			c84.998,97.226,75.388,243.379-24.528,330.729c-99.915,87.35-251.727,82.317-336.725-14.908S7.784,176.594,107.7,89.244z"
    />
    <g>
      <path
        className="fill-owl"
        d="M244.029,141.49c-17.92,37.27-63.032,51.341-100.302,33.421
				c-37.27-17.92-53.234-61.357-35.315-98.627c17.92-37.27,62.835-54.046,100.105-36.126
				C245.787,58.078,261.948,104.22,244.029,141.49z"
      />
      <path
        className="opacity-10 fill-prim"
        d="M128.086,97.65c17.92-37.27,62.835-54.046,100.105-36.126
				c4.127,1.984,7.994,4.316,11.586,6.942c-7.335-11.909-17.95-21.909-31.26-28.308c-37.27-17.92-82.185-1.144-100.105,36.126
				c-15.805,32.872-5.247,70.538,23.036,91.265C118.963,147.091,116.789,121.146,128.086,97.65z"
      />
    </g>
    <path
      className="fill-owl"
      d="M217.121,218.367c-1.17-5.733,2.71-11.178,8.442-12.348c5.733-1.17,11.248,2.359,12.418,8.091
			c1.17,5.733-2.456,11.466-8.189,12.635C224.06,227.916,218.291,224.099,217.121,218.367z"
    />
    <path
      className="opacity-50 fill-prince"
      d="M363.151,96.945c-1.17-5.733,2.71-11.178,8.442-12.348s11.248,2.359,12.418,8.091
			c1.17,5.733-2.456,11.466-8.189,12.636C370.089,106.493,364.32,102.677,363.151,96.945z"
    />
    <path
      className="fill-owl"
      d="M282.752,398.389c8.691-7.598,21.813-6.256,29.411,2.435c7.598,8.691,6.926,21.591-1.765,29.189
			c-8.691,7.598-22.059,6.972-29.657-1.719C273.143,419.603,274.061,405.987,282.752,398.389z"
    />
    <path
      className="opacity-50 fill-prince"
      d="M58.327,220.961c-1.17-5.733,2.71-11.178,8.442-12.348
			c5.733-1.17,11.248,2.359,12.418,8.091s-2.456,11.466-8.189,12.636C65.265,230.51,59.496,226.694,58.327,220.961z"
    />
    <path
      className="fill-owl"
      d="M468.947,281.701c-3.725,36.649-37.256,62.098-73.905,58.373
			c-36.649-3.725-63.177-35.279-59.452-71.928c3.725-36.649,36.272-64.305,72.921-60.58
			C445.16,211.292,472.673,245.052,468.947,281.701z"
    />
    <g>
      <path
        className="fill-owl"
        d="M173.239,331.136c14.631,25.328,4.867,57.294-20.461,71.925
				c-25.328,14.631-57.07,6.642-71.701-18.686c-14.631-25.328-6.526-58.257,18.802-72.888
				C125.206,296.855,158.608,305.808,173.239,331.136z"
      />
      <path
        className="opacity-10 fill-prim"
        d="M112.818,324.329c18.464-10.666,41.21-8.787,57.855,2.82
				c-15.693-22.238-46.847-29.497-70.794-15.663c-25.328,14.631-33.433,47.561-18.802,72.888c4.04,6.993,9.388,12.657,15.541,16.895
				c-0.915-1.299-1.788-2.644-2.602-4.052C79.385,371.89,87.49,338.96,112.818,324.329z"
      />
    </g>
    <path
      className="opacity-10 fill-prim"
      d="M349.701,282.093c3.725-36.649,36.272-64.305,72.921-60.579
			c12.217,1.242,23.415,5.824,32.783,12.735c-11.007-14.534-27.694-24.73-46.893-26.682c-36.649-3.725-69.196,23.93-72.921,60.579
			c-2.465,24.247,8.316,46.261,26.506,59.464C352.777,315.06,347.969,299.128,349.701,282.093z"
    />
    <path
      className="fill-prim"
      style={{ opacity: 0.2 }}
      d="M254.81,381.707c-105.358,0-198.419-52.064-254.72-131.654
		c-2.703,99.72,55.552,194.334,153.936,236.742c128.773,55.507,279.648,1.534,335.155-127.239
		c15.267-35.419,21.657-72.747,20.288-109.416C453.162,329.68,360.13,381.707,254.81,381.707z"
    />
  </svg>
);

// const MockSvg = () => (
//   <svg viewBox="0 0 512 512">
//     <path
//       className="fill-#F4F4F5"
//       d="M426.655,444.491c-85.064,74.278-206.9,83.839-299.319,29.581
// 			c-22.308-13.074-42.982-29.907-60.958-50.499C56,411.723,46.93,399.058,39.085,385.82C15.143,345.045,3.539,298.958,3.784,252.953
// 			c0.49-71.582,29.989-142.754,87.026-192.6C138.776,18.433,197.855-1.096,256.69,0.047c45.597,0.817,91.03,13.973,131.069,38.733
// 			c22.063,13.564,42.41,30.724,60.305,51.153c9.724,11.114,18.386,22.799,25.822,34.974
// 			C537.623,227.785,521.117,361.878,426.655,444.491z"
//     />
//     <path
//       className="fill-#EDEDEC"
//       d="M107.7,89.244c99.915-87.35,248.817-74.175,333.815,23.051
// 			c84.998,97.226,75.388,243.379-24.528,330.729c-99.915,87.35-251.727,82.317-336.725-14.908S7.784,176.594,107.7,89.244z"
//     />
//     <g>
//       <path
//         className="fill-#D8D8D8"
//         d="M244.029,141.49c-17.92,37.27-63.032,51.341-100.302,33.421
// 				c-37.27-17.92-53.234-61.357-35.315-98.627c17.92-37.27,62.835-54.046,100.105-36.126
// 				C245.787,58.078,261.948,104.22,244.029,141.49z"
//       />
//       <path
//         className="opacity-10 fill-#040000"
//         d="M128.086,97.65c17.92-37.27,62.835-54.046,100.105-36.126
// 				c4.127,1.984,7.994,4.316,11.586,6.942c-7.335-11.909-17.95-21.909-31.26-28.308c-37.27-17.92-82.185-1.144-100.105,36.126
// 				c-15.805,32.872-5.247,70.538,23.036,91.265C118.963,147.091,116.789,121.146,128.086,97.65z"
//       />
//     </g>
//     <path
//       className="fill-#D8D8D8"
//       d="M217.121,218.367c-1.17-5.733,2.71-11.178,8.442-12.348c5.733-1.17,11.248,2.359,12.418,8.091
// 			c1.17,5.733-2.456,11.466-8.189,12.635C224.06,227.916,218.291,224.099,217.121,218.367z"
//     />
//     <path
//       className="opacity-50 fill-#FFFFFF"
//       d="M363.151,96.945c-1.17-5.733,2.71-11.178,8.442-12.348s11.248,2.359,12.418,8.091
// 			c1.17,5.733-2.456,11.466-8.189,12.636C370.089,106.493,364.32,102.677,363.151,96.945z"
//     />
//     <path
//       className="fill-#D8D8D8"
//       d="M282.752,398.389c8.691-7.598,21.813-6.256,29.411,2.435c7.598,8.691,6.926,21.591-1.765,29.189
// 			c-8.691,7.598-22.059,6.972-29.657-1.719C273.143,419.603,274.061,405.987,282.752,398.389z"
//     />
//     <path
//       className="opacity-50 fill-#FFFFFF"
//       d="M58.327,220.961c-1.17-5.733,2.71-11.178,8.442-12.348
// 			c5.733-1.17,11.248,2.359,12.418,8.091s-2.456,11.466-8.189,12.636C65.265,230.51,59.496,226.694,58.327,220.961z"
//     />
//     <path
//       className="fill-#D8D8D8"
//       d="M468.947,281.701c-3.725,36.649-37.256,62.098-73.905,58.373
// 			c-36.649-3.725-63.177-35.279-59.452-71.928c3.725-36.649,36.272-64.305,72.921-60.58
// 			C445.16,211.292,472.673,245.052,468.947,281.701z"
//     />
//     <g>
//       <path
//         className="fill-#D8D8D8"
//         d="M173.239,331.136c14.631,25.328,4.867,57.294-20.461,71.925
// 				c-25.328,14.631-57.07,6.642-71.701-18.686c-14.631-25.328-6.526-58.257,18.802-72.888
// 				C125.206,296.855,158.608,305.808,173.239,331.136z"
//       />
//       <path
//         className="opacity-10 fill-#040000"
//         d="M112.818,324.329c18.464-10.666,41.21-8.787,57.855,2.82
// 				c-15.693-22.238-46.847-29.497-70.794-15.663c-25.328,14.631-33.433,47.561-18.802,72.888c4.04,6.993,9.388,12.657,15.541,16.895
// 				c-0.915-1.299-1.788-2.644-2.602-4.052C79.385,371.89,87.49,338.96,112.818,324.329z"
//       />
//     </g>
//     <path
//       className="opacity-10 fill-#040000"
//       d="M349.701,282.093c3.725-36.649,36.272-64.305,72.921-60.579
// 			c12.217,1.242,23.415,5.824,32.783,12.735c-11.007-14.534-27.694-24.73-46.893-26.682c-36.649-3.725-69.196,23.93-72.921,60.579
// 			c-2.465,24.247,8.316,46.261,26.506,59.464C352.777,315.06,347.969,299.128,349.701,282.093z"
//     />
//     <path
//       className="fill-#040000"
//       style={{ opacity: 0.06 }}
//       d="M254.81,381.707c-105.358,0-198.419-52.064-254.72-131.654
// 		c-2.703,99.72,55.552,194.334,153.936,236.742c128.773,55.507,279.648,1.534,335.155-127.239
// 		c15.267-35.419,21.657-72.747,20.288-109.416C453.162,329.68,360.13,381.707,254.81,381.707z"
//     />
//   </svg>
// );
