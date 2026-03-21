const STYLE_TAG_ID = "chai-runtime-styles"; // Unique ID for the style tag to prevent duplicates

export function ensureStyleSheet() {
  let styleTag = document.getElementById(STYLE_TAG_ID);

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = STYLE_TAG_ID;
    document.head.appendChild(styleTag);
  }

  return styleTag.sheet;
}

//this function is used to apply a CSS rule to the stylesheet. Basically, it takes the stylesheet and the rule text (e.g., ".class { color: red; }") and inserts it into the stylesheet. It also includes error handling to catch any invalid CSS rules that might be generated, logging a warning instead of breaking the entire engine.

export function applyRule(sheet, ruleText) {
  if (!sheet || !ruleText) return;

  try {
    sheet.insertRule(ruleText, sheet.cssRules.length);
  } catch (error) {
    console.warn("Invalid CSS rule skipped:", ruleText, error);
  }
}
//This function basically takes an HTML element and a style object (e.g., { color: "red", backgroundColor: "blue" }) and applies those styles directly to the element's inline styles.

export function applyStyle(element, styleObject) {
  if (!styleObject || !element) return;

  Object.keys(styleObject).forEach((key) => {
    element.style[key] = styleObject[key];
  });
}
