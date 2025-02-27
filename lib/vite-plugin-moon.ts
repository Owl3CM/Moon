// vite-plugin-moon.js
import { Watcher, PurgeCSS } from "./workflow.js";

export default function moonPlugin() {
  return {
    name: "vite-plugin-moon",
    async buildStart() {
      //   if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") await Watcher();
      //   else await PurgeCSS();
      if (process.env.NODE_ENV === "production") await PurgeCSS();
    },
    configureServer(server) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") Watcher();
    },
    async closeBundle() {
      // This hook is called when the build is finished in production mode.
      //   if (process.env.NODE_ENV === "production") {
      //     await PurgeCSS();
      //   }
    },
  };
}
