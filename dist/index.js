"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const e = {
  theme: "",
  changeTheme: (t) => {
    e.theme && document.documentElement.classList.remove(e.theme), document.documentElement.classList.add(t), (e.theme = t);
  },
};
(exports.changeTheme = (t) => e.changeTheme(t)), (exports.currentTheme = () => e.theme);
//# sourceMappingURL=index.js.map
