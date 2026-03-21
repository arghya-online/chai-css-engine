import { extractClasses } from "./extratct.js";
import { generateRule } from "./generate.js";
import { ensureStyleSheet, applyRule } from "./apply.js";
import { chaiConfig } from "./chai.config.js";

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

    const extracted = extractClasses();
    const classNames = [...new Set(extracted.map((item) => item.className))];
    const sheet = ensureStyleSheet();

    classNames.forEach((className) => {
      const rule = generateRule(className, chaiConfig);
      applyRule(sheet, rule);
    });

    console.log(`Generated ${classNames.length} utility rules`);
  });
}
