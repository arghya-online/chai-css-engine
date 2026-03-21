# ChaiTailwind

A lightweight runtime utility-class engine inspired by Tailwind CSS.  
Instead of prebuilding CSS, this project scans the DOM at page load, interprets classes that start with `chai-`, generates style objects, and applies inline styles directly to matching elements.

---

## 1. Project Purpose

This project demonstrates a **mini JIT-like styling engine** for utility classes in pure JavaScript.

Core idea:

- Write classes like `chai-p-20` or `chai-bg-red-500` in HTML.
- At runtime, parse those classes.
- Convert them to CSS style rules.
- Apply styles directly to elements via `element.style`.

It is designed as a learning/experimental architecture rather than a production CSS framework.

---

## 2. High-Level Architecture

The runtime pipeline is:

1. Browser loads `index.html`.
2. `index.html` loads `src/index.js` as ES module.
3. `src/index.js` calls `startEngine()` from `src/engine.js`.
4. `startEngine()` waits for `DOMContentLoaded`.
5. Engine calls `extractClasses()` to collect all `chai-*` classes.
6. For each extracted class:
   - `generateStyle(className)` converts class token → style object.
   - `applyStyle(element, styleObject)` writes inline CSS to the element.

So the project behaves like a tiny interpreter:

- **Input:** class tokens (`chai-...`)
- **Translation:** JS mapping rules
- **Output:** inline style declarations

---

## 3. Folder and File Responsibilities

### `index.html`

Primary demo page and runtime entry document.

Responsibilities:

- Defines sample UI blocks using `chai-*` utility classes.
- Loads the engine through:
  - `<script type="module" src="./src/index.js"></script>`

Notes:

- This file is currently a full preview page with sections for color, spacing, typography, sizing, and border/radius.

### `src/index.js`

Minimal bootstrap module.

Responsibilities:

- Imports `startEngine` from `engine.js`.
- Executes `startEngine()`.

### `src/engine.js`

Main orchestrator.

Responsibilities:

- Imports the three core modules:
  - `extractClasses` from `extratct.js`
  - `generateStyle` from `generate.js`
  - `applyStyle` from `apply.js`
- Loads Google Inter font and applies default body font.
- Runs processing after `DOMContentLoaded`.
- Performs the core loop:
  - extract class records
  - generate style object for each class
  - apply style object to the corresponding element

### `src/extratct.js`

Class discovery module.  
(Spelling is currently `extratct.js`, not `extract.js`.)

Responsibilities:

- Queries all DOM elements (`document.querySelectorAll("*")`).
- Iterates through each element’s class list.
- Filters classes by prefix `chai-`.
- Returns array of records:
  - `{ element, className }`

### `src/generate.js`

Class parser and style generator.

Responsibilities:

- Parses `chai-*` classes by splitting on `-`.
- Identifies utility type (`bg`, `text`, `p`, `m`, `fs`, `w`, `h`, `border`, `rounded`, `radius`).
- Resolves value segment(s).
- Produces style object such as:
  - `{ "padding": "20px" }`
  - `{ "background-color": "#ef4444" }`

Includes:

- Numeric-to-px conversion helper (`withPxIfNumeric`).
- Tailwind-like shade palette resolver (`resolveShadeColor`) for color utilities.

### `src/apply.js`

Style application module.

Responsibilities:

- Receives DOM element and style object.
- Iterates style keys.
- Writes each style via `element.style[key] = value`.

### `package.json`

Project metadata file.

Current state:

- Minimal metadata only.
- No build/dev scripts configured.

---

## 4. Utility Class Grammar

General pattern:

`chai-<type>-<value>`

Examples:

- `chai-p-20`
- `chai-fs-36`
- `chai-bg-red-500`
- `chai-text-slate-700`

### Supported utility types

- `bg` → `background-color`
- `text` → `color`
- `p` → `padding`
- `m` → `margin`
- `fs` → `font-size`
- `w` → `width`
- `h` → `height`
- `border` → `border`
- `rounded` / `radius` → `border-radius`

---

## 5. Color Shade System

`bg` and `text` support Tailwind-like shades:

- Form: `chai-bg-<color>-<shade>`
- Form: `chai-text-<color>-<shade>`

Current built-in palette names:

- `red`
- `blue`
- `green`
- `slate`

Current shade keys:

- `50, 100, 200, 300, 400, 500, 600, 700, 800, 900`

Default behavior:

- If shade is omitted (example `chai-bg-red`), it defaults to `500`.
- If token is unknown in palette, value is used as-is (fallback), allowing native CSS colors such as:
  - `chai-bg-white`
  - `chai-text-black`
  - `chai-bg-#ff0000` (if class tokenization permits in your HTML usage)

---

## 6. Value Conversion Rules

### Numeric conversion

For spacing/sizing/radius/font utilities, pure numeric values are converted to `px`:

- `chai-p-20` → `padding: 20px`
- `chai-w-300` → `width: 300px`
- `chai-radius-12` → `border-radius: 12px`

### Raw pass-through

If value is not purely numeric, it is passed through unchanged:

- `chai-border-solid` → `border: solid` (valid but visually minimal)
- `chai-border-1px-solid-red` → `border: 1px-solid-red` (string passed as-is; format may not be valid CSS unless spacing is represented differently)

---

## 7. File-to-File Connections (Dependency Graph)

- `index.html` → loads `src/index.js`
- `src/index.js` → imports and calls `startEngine` from `src/engine.js`
- `src/engine.js` → imports:
  - `src/extratct.js`
  - `src/generate.js`
  - `src/apply.js`
- `src/engine.js` runtime loop:
  - `extractClasses()` output feeds `generateStyle()`
  - `generateStyle()` output feeds `applyStyle()`

This creates a clear **three-stage pipeline**:

1. Discovery (`extractClasses`)
2. Translation (`generateStyle`)
3. Application (`applyStyle`)

---

## 8. Runtime Lifecycle Details

When `startEngine()` runs:

1. Prints `Engine initiated` to console.
2. Registers `DOMContentLoaded` listener.
3. On DOM ready:
   - Injects Inter font `<link>` into `<head>`.
   - Sets `document.body.style.fontFamily = "Inter, sans-serif"`.
   - Scans all elements for `chai-*` classes.
   - Applies each utility class as inline style.

Important behavior:

- Processing happens once at load time.
- Dynamically added elements/classes after load are not reprocessed automatically.

---

## 9. How to Run

Option A (simplest):

- Open `index.html` in a browser that supports ES modules.

Option B (recommended for development):

- Serve project through a local static server (for consistent module behavior).

No bundler or build step is required in current architecture.

---

## 10. Known Constraints / Limitations

1. **One-time processing only**
   - No MutationObserver or re-run hook for dynamic DOM updates.

2. **Inline style strategy**
   - Styles are applied directly on elements, not through generated stylesheet classes.

3. **Tokenization limitations**
   - Class values are split by `-`, so complex CSS values are constrained by class encoding style.

4. **Border utility is simplistic**
   - `border` utility currently assigns the value string directly.

5. **No precedence system**
   - If conflicting utilities are present, later-applied inline assignments win by iteration order.

6. **Typo in filename**
   - `extratct.js` is misspelled; works only because imports match that exact filename.

---

## 11. Extending the Engine

### Add a new utility type

1. Open `src/generate.js`.
2. Add a new `case` in the switch on `type`.
3. Map token to a valid CSS property.

Example pattern:

```js
case "lh":
  style["line-height"] = withPxIfNumeric(value);
  break;
```

Then use in HTML:

- `chai-lh-28`

### Add new color palettes

1. Open `src/generate.js`.
2. Extend `colorPalette` with new color family and shade scale.
3. Use classes like `chai-bg-emerald-500`.

### Support dynamic content

You can enhance `src/engine.js` with:

- a re-run function
- `MutationObserver` to process newly inserted nodes/classes

---

## 12. Troubleshooting Guide

### Utilities not applying

Check:

1. `index.html` script path must be `./src/index.js`.
2. Class names must start with `chai-`.
3. Browser console for warnings like `Unknown type: ...`.
4. Ensure module files load without 404/network errors.

### Color class not resolving shade

Check:

1. Color family exists in `colorPalette`.
2. Shade key is one of `50..900` present in that family.
3. Class format is `chai-bg-color-shade` or `chai-text-color-shade`.

### Border not visible

Use a complete border value encoding strategy compatible with your parser, or add dedicated border-width/style/color utilities in `generate.js`.

---

## 13. Current Example Coverage

The current `index.html` preview demonstrates:

- Color shades (`bg`/`text`)
- Typography (`fs`)
- Spacing (`p`, `m`)
- Sizing (`w`, `h`)
- Border and radius (`border`, `rounded`, `radius`)

It is intended as a quick visual verification page for engine behavior.

---

## 14. Summary

ChaiTailwind is a modular, runtime utility interpreter built from four focused stages:

- **Bootstrap:** `index.js`
- **Orchestration:** `engine.js`
- **Class extraction:** `extratct.js`
- **Style generation:** `generate.js`
- **Style application:** `apply.js`

The design is intentionally simple and educational, while still being extensible for additional utility types, palettes, and runtime reprocessing features.
