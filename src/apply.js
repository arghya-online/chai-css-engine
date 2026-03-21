export function applyStyle(element, styleObject) {
  if (!styleObject) return;

  Object.keys(styleObject).forEach((key) => {
    element.style[key] = styleObject[key];
  });
}
