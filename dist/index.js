"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=function(){return e=Object.assign||function(e){for(var t,o=1,n=arguments.length;o<n;o++)for(var c in t=arguments[o])Object.prototype.hasOwnProperty.call(t,c)&&(e[c]=t[c]);return e},e.apply(this,arguments)},t={},o={currentTheme:"",setTheme:function(e){o.removeColors(),o.currentTheme&&document.documentElement.classList.remove(o.currentTheme),document.documentElement.classList.add(e),o.currentTheme=e},removeColors:function(e){e||(e=Object.keys(t));var o=document.documentElement;e.forEach((function(e){o.style.removeProperty("--".concat(e))}))},setColors:function(o){t=e(e({},t),o),Object.entries(t).forEach((function(e){var t=e[0],n=e[1],c=document.documentElement;o[t]?c.style.setProperty("--".concat(t),"".concat(n)):c.style.removeProperty("--".concat(t))})),setTimeout((function(){var e=document.documentElement;Object.entries(t).forEach((function(t){var o=t[0],n=t[1];e.style.setProperty("--".concat(o),"".concat(n))}))}),0)},updateColors:function(o){t=e(e({},t),o),setTimeout((function(){var e=document.documentElement;Object.entries(t).forEach((function(t){var o=t[0],n=t[1];e.style.setProperty("--".concat(o),"".concat(n))}))}),0)},setColor:function(e,t){document.documentElement.style.setProperty("--".concat(e),"".concat(t))},removeColor:function(e){document.documentElement.style.removeProperty("--".concat(e))}};exports.Moon=o;
