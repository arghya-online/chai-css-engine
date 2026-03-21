import { chaiConfig } from "./chai.config.js";

function withUnits(rawValue, scale = {}) {
  if (!rawValue) return rawValue;

  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    return rawValue.slice(1, -1);
  }

  if (scale[rawValue]) {
    return scale[rawValue];
  }

  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    return `${rawValue}px`;
  }

  if (/^-?\d+(\.\d+)?p$/.test(rawValue)) {
    return `${rawValue.slice(0, -1)}%`;
  }

  return rawValue;
}

function resolveColor(rawValue, config) {
  if (!rawValue) return rawValue;

  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    return rawValue.slice(1, -1);
  }

  const segments = rawValue.split("-");
  const maybeShade = segments[segments.length - 1];
  const hasShade = /^\d{2,3}$/.test(maybeShade);
  const colorName = hasShade ? segments.slice(0, -1).join("-") : rawValue;
  const shade = hasShade ? maybeShade : config.defaultShade;
  const palette = config.theme?.colors || {};

  if (palette[colorName] && palette[colorName][shade]) {
    return palette[colorName][shade];
  }

  return rawValue;
}

function escapeClassName(className) {
  return className.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

export function generateStyle(className, config = chaiConfig) {
  const prefix = `${config.prefix}-`;

  if (!className.startsWith(prefix)) {
    return null;
  }

  const payload = className.slice(prefix.length);
  const segments = payload.split("-");
  const type = segments[0];
  const value = segments.slice(1).join("-");
  const spacingScale = config.theme?.spacing || {};
  const fontScale = config.theme?.fontSize || {};

  switch (type) {
    case "bg":
      return {
        property: "background-color",
        value: resolveColor(value, config),
      };
    case "text":
      return { property: "color", value: resolveColor(value, config) };
    case "p":
      return { property: "padding", value: withUnits(value, spacingScale) };
    case "m":
      return { property: "margin", value: withUnits(value, spacingScale) };
    case "fs":
      return { property: "font-size", value: withUnits(value, fontScale) };
    case "w":
      return { property: "width", value: withUnits(value, spacingScale) };
    case "h":
      return { property: "height", value: withUnits(value, spacingScale) };
    case "border":
      return { property: "border", value: value.replaceAll("_", " ") };
    case "rounded":
    case "radius":
      return {
        property: "border-radius",
        value: withUnits(value, spacingScale),
      };
    default:
      return null;
  }
}

export function generateRule(className, config = chaiConfig) {
  const style = generateStyle(className, config);

  if (!style) return null;

  const selector = `.${escapeClassName(className)}`;
  return `${selector}{${style.property}:${style.value};}`;
}
