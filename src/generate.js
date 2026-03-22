import { chaiConfig } from "./chai.config.js";

function getArbitraryValue(rawValue) {
  if (!rawValue) {
    return null;
  }

  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    return rawValue.slice(1, -1).replaceAll("_", " ");
  }

  return null;
}

function normalizeUnitlessValue(rawValue) {
  const arbitrary = getArbitraryValue(rawValue);
  if (arbitrary !== null) {
    return arbitrary;
  }

  return rawValue;
}

function resolveScaledValue(rawValue, scale = {}) {
  if (!rawValue) {
    return rawValue;
  }

  const arbitrary = getArbitraryValue(rawValue);
  if (arbitrary !== null) {
    return arbitrary;
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
  if (!rawValue) {
    return rawValue;
  }

  const arbitrary = getArbitraryValue(rawValue);
  if (arbitrary !== null) {
    return arbitrary;
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

function toSpaceSeparated(rawValue) {
  return rawValue.replaceAll("_", " ");
}

function toDashSeparated(rawValue) {
  return rawValue.replaceAll("_", "-");
}

function escapeClassName(className) {
  return className.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

function splitUtilityClass(className, config) {
  const prefix = `${config.prefix}-`;

  if (!className.startsWith(prefix)) {
    return null;
  }

  const payload = className.slice(prefix.length);

  const specialPrefixes = [
    ["gridcols-", "grid-template-columns"],
    ["gridrows-", "grid-template-rows"],
    ["borderb-", "border-bottom"],
    ["bordert-", "border-top"],
  ];

  for (const [prefixText, cssProperty] of specialPrefixes) {
    if (payload.startsWith(prefixText)) {
      return {
        type: cssProperty,
        value: payload.slice(prefixText.length),
        isDirectProperty: true,
      };
    }
  }

  const segments = payload.split("-");
  return {
    type: segments[0],
    value: segments.slice(1).join("-"),
    isDirectProperty: false,
  };
}

function resolveDirectPropertyStyle(type, value) {
  if (type === "grid-template-columns" || type === "grid-template-rows") {
    return {
      property: type,
      value: resolveScaledValue(value),
    };
  }

  if (type === "border-bottom" || type === "border-top") {
    return {
      property: type,
      value: toSpaceSeparated(resolveScaledValue(value)),
    };
  }

  return null;
}

function buildUtilityResolvers(config) {
  const spacingScale = config.theme?.spacing || {};
  const fontScale = config.theme?.fontSize || {};

  return {
    bg: (value) => ({
      property: "background-color",
      value: resolveColor(value, config),
    }),
    text: (value) => ({
      property: "color",
      value: resolveColor(value, config),
    }),
    p: (value) => ({
      property: "padding",
      value: resolveScaledValue(value, spacingScale),
    }),
    m: (value) => ({
      property: "margin",
      value: resolveScaledValue(value, spacingScale),
    }),
    fs: (value) => ({
      property: "font-size",
      value: resolveScaledValue(value, fontScale),
    }),
    w: (value) => ({
      property: "width",
      value: resolveScaledValue(value, spacingScale),
    }),
    h: (value) => ({
      property: "height",
      value: resolveScaledValue(value, spacingScale),
    }),
    border: (value) => ({ property: "border", value: toSpaceSeparated(value) }),
    rounded: (value) => ({
      property: "border-radius",
      value: resolveScaledValue(value, spacingScale),
    }),
    radius: (value) => ({
      property: "border-radius",
      value: resolveScaledValue(value, spacingScale),
    }),
    d: (value) => ({ property: "display", value: resolveScaledValue(value) }),
    gap: (value) => ({
      property: "gap",
      value: resolveScaledValue(value, spacingScale),
    }),
    items: (value) => ({
      property: "align-items",
      value: toDashSeparated(resolveScaledValue(value)),
    }),
    justify: (value) => ({
      property: "justify-content",
      value: toDashSeparated(resolveScaledValue(value)),
    }),
    flexdir: (value) => ({
      property: "flex-direction",
      value: toDashSeparated(resolveScaledValue(value)),
    }),
    fw: (value) => ({
      property: "font-weight",
      value: normalizeUnitlessValue(value),
    }),
    lh: (value) => ({
      property: "line-height",
      value: normalizeUnitlessValue(value),
    }),
    ta: (value) => ({
      property: "text-align",
      value: resolveScaledValue(value),
    }),
    shadow: (value) => ({
      property: "box-shadow",
      value: toSpaceSeparated(resolveScaledValue(value)),
    }),
    minh: (value) => ({
      property: "min-height",
      value: resolveScaledValue(value, spacingScale),
    }),
    pos: (value) => ({
      property: "position",
      value: resolveScaledValue(value),
    }),
    top: (value) => ({
      property: "top",
      value: resolveScaledValue(value, spacingScale),
    }),
    z: (value) => ({
      property: "z-index",
      value: normalizeUnitlessValue(value),
    }),
    backdrop: (value) => ({
      property: "backdrop-filter",
      value: resolveScaledValue(value),
    }),
    mt: (value) => ({
      property: "margin-top",
      value: resolveScaledValue(value, spacingScale),
    }),
    mb: (value) => ({
      property: "margin-bottom",
      value: resolveScaledValue(value, spacingScale),
    }),
    ml: (value) => ({
      property: "margin-left",
      value: resolveScaledValue(value, spacingScale),
    }),
    mr: (value) => ({
      property: "margin-right",
      value: resolveScaledValue(value, spacingScale),
    }),
    pt: (value) => ({
      property: "padding-top",
      value: resolveScaledValue(value, spacingScale),
    }),
    pb: (value) => ({
      property: "padding-bottom",
      value: resolveScaledValue(value, spacingScale),
    }),
    pl: (value) => ({
      property: "padding-left",
      value: resolveScaledValue(value, spacingScale),
    }),
    pr: (value) => ({
      property: "padding-right",
      value: resolveScaledValue(value, spacingScale),
    }),
  };
}

export function generateStyle(className, config = chaiConfig) {
  const parsed = splitUtilityClass(className, config);
  if (!parsed) {
    return null;
  }

  if (parsed.isDirectProperty) {
    return resolveDirectPropertyStyle(parsed.type, parsed.value);
  }

  const resolvers = buildUtilityResolvers(config);
  const resolveStyle = resolvers[parsed.type];

  if (!resolveStyle) {
    return null;
  }

  return resolveStyle(parsed.value);
}

export function generateRule(className, config = chaiConfig) {
  const style = generateStyle(className, config);

  if (!style) return null;

  const selector = `.${escapeClassName(className)}`;
  return `${selector}{${style.property}:${style.value};}`;
}
