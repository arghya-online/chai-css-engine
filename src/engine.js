import { extractClasses } from "./extratct.js";
import { generateStyle } from "./generate.js";
import { applyStyle } from "./apply.js";

function loadDefaultFont() {
  const link = document.createElement("link");

  link.href =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap";

  link.rel = "stylesheet";

  document.head.appendChild(link);
}

function applyDefaultFont() {
  document.body.style.fontFamily = "Inter, sans-serif";
}

export function startEngine() {
  console.log("Engine initiated");

  window.addEventListener("DOMContentLoaded", () => {
    loadDefaultFont();
    applyDefaultFont();

    const result = extractClasses();

    // result.forEach((items) => {
    //   generateStyle(items.className);
    // });

    result.forEach((items) => {
      const style = generateStyle(items.className);
      applyStyle(items.element, style);
    });
  });
}
