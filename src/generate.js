export function generateStyle(className) {
  const parts = className.split("-");

  const type = parts[1];
  const value = parts.slice(2).join("-");

  const colorPalette = {
    red: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    blue: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    green: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
    slate: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  };

  let style = {};

  const withPxIfNumeric = (rawValue) => {
    if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
      return `${rawValue}px`;
    }
    return rawValue;
  };

  const resolveShadeColor = (rawValue) => {
    const segments = rawValue.split("-");
    const maybeShade = segments[segments.length - 1];
    const hasShade = /^\d{2,3}$/.test(maybeShade);
    const colorName = hasShade ? segments.slice(0, -1).join("-") : rawValue;
    const shade = hasShade ? maybeShade : "500";

    if (colorPalette[colorName] && colorPalette[colorName][shade]) {
      return colorPalette[colorName][shade];
    }

    return rawValue;
  };
  //withPcIFNumeric does the same but for percentage values, that is basically if the value ends with "p" it will be converted to percentage, for example "50p" will be converted to "50%"

  switch (type) {
    case "bg":
      style["background-color"] = resolveShadeColor(value);
      break;
    case "text":
      style["color"] = resolveShadeColor(value);
      break;
    case "p":
      style["padding"] = withPxIfNumeric(value);
      break;
    case "m":
      style["margin"] = withPxIfNumeric(value);
      break;
    case "fs":
      style["font-size"] = withPxIfNumeric(value);
      break;
    case "w":
      style["width"] = withPxIfNumeric(value);
      break;
    case "h":
      style["height"] = withPxIfNumeric(value);
      break;
    case "border":
      style["border"] = value;
      break;
    case "rounded":
    case "radius":
      style["border-radius"] = withPxIfNumeric(value);
      break;
    default:
      console.warn(`Unknown type: ${type}`);
  }
  return style;
}
