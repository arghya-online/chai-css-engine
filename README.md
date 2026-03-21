# chai-css-engine

`chai-css-engine` is a lightweight utility-class CSS engine inspired by Tailwind-style workflows.

You write utility classes directly in HTML (for example: `chai-bg-red-500`, `chai-p-4`, `chai-fs-xl`).
At runtime, the engine scans your DOM, converts each utility class into a real CSS rule, and injects those rules into a `<style>` tag.

This README is a beginner-first, detailed technical guide covering:

- Setup from zero
- What each file does
- How modules connect
- How each class is parsed and converted
- How to customize tokens (colors, spacing, font sizes)
- Common errors and how to debug

---

## 1) What this project is and is not

### What it is

- A runtime utility engine
- A small, readable architecture for learning and experimentation
- A library build powered by Vite
- A demo page showing setup and class usage

### What it is not

- A full Tailwind replacement
- A precompiled production CSS framework
- A system with variants like `hover:`, `md:` (not implemented yet)

---

## 2) Prerequisites

- Node.js `>= 14.0.0` (from `package.json`)
- npm
- A modern browser with ES module support

---

## 3) Installation and first run (beginner path)

### Step 1: Open the correct folder

Make sure your terminal is inside the project folder that contains `package.json`.

```powershell
cd "S:\Programming Base\CohortAssignments\chaicode_blog_template\chai-css-engine"
```

Quick checks:

```powershell
Get-Location
Test-Path .\package.json
```

`Test-Path` must return `True`.

### Step 2: Install packages

```bash
npm install
```

### Step 3: Start dev server

```bash
npm run dev
```

Vite may switch ports automatically if `5173` is busy. Use the exact URL printed in the terminal.

### Step 4: Open app

- Root URL redirects to demo: `http://localhost:<port>/`
- Demo page direct path: `http://localhost:<port>/demo/`

---

## 4) NPM scripts explained

From `package.json`:

- `npm run dev`
  - Starts Vite dev server for local development
- `npm run build`
  - Builds library outputs into `dist/`
- `npm run preview`
  - Serves built output for preview

---

## 5) Project structure and purpose

```text
chai-css-engine/
  demo/
    index.html
  src/
    apply.js
    chai.config.js
    engine.js
    extratct.js
    generate.js
    index.js
  index.html
  vite.config.js
  package.json
```

### High-level responsibility map

- `src/index.js`: Public entry exports and re-exports
- `src/engine.js`: Runtime orchestration
- `src/extratct.js`: DOM class discovery
- `src/generate.js`: Utility parsing and CSS rule generation
- `src/apply.js`: StyleSheet creation + rule insertion
- `src/chai.config.js`: Theme/config tokens (prefix, colors, spacing, font sizes)
- `demo/index.html`: Beginner demo/tutorial page
- `index.html`: Redirects `/` to `/demo/`

---

## 6) End-to-end runtime flow

When `startEngine()` runs:

1. Waits for `DOMContentLoaded`
2. Loads Inter font link and sets body font
3. Calls `extractClasses()` to collect `chai-*` classes from DOM
4. Deduplicates class names with `Set`
5. Ensures one runtime stylesheet exists
6. Converts each class name to a CSS rule using `generateRule()`
7. Inserts each rule into the runtime stylesheet

Result: elements are styled by generated CSS class selectors, not inline per-element style application.

---

## 7) File-by-file deep dive

## `src/chai.config.js`

This is your design-token source.

### Main keys

- `prefix`: utility class prefix (`chai`)
- `defaultShade`: fallback color shade when shade not specified (`500`)
- `theme.spacing`: spacing scale map
- `theme.fontSize`: font size scale map
- `theme.colors`: palette with shade steps (`50` to `900`)

### Why this matters

The parser in `generate.js` resolves values from these maps first, then falls back to raw numeric/custom parsing.

---

## `src/extratct.js`

> Filename note: file is currently spelled `extratct.js` (typo), and imports match this name.

### `extractClasses()` behavior

- Selects all elements with `document.querySelectorAll("*")`
- Iterates each element's `classList`
- Keeps only classes starting with `chai-`
- Returns records shaped like:

```js
{
  (element, className);
}
```

### Why include `element`

The previous architecture used direct inline style application.
Current engine only needs unique class names for rule generation, but this record shape remains compatible.

---

## `src/generate.js`

This file is the parser/compiler layer.

### Helper: `withUnits(rawValue, scale = {})`

Resolution order:

1. Bracket arbitrary value (`[37px]`) -> `37px`
2. Token lookup in provided scale (`4` -> `1rem` from spacing)
3. Numeric value -> append `px` (`320` -> `320px`)
4. Percent shorthand with `p` suffix (`50p` -> `50%`)
5. Otherwise return raw value unchanged

### Helper: `resolveColor(rawValue, config)`

- Supports bracket values (`[#1f2937]` -> `#1f2937`)
- Splits token by `-`
- Detects shade if last segment is 2-3 digits
- Uses `config.defaultShade` when no shade provided
- Looks up `config.theme.colors[colorName][shade]`
- Falls back to raw value if not found

Example:

- `red-500` -> `#ef4444`
- `red` -> uses default shade `500`

### Helper: `escapeClassName(className)`

Escapes special characters for CSS selectors.
Needed for classes containing symbols like `[` `]` `#` `%` etc.

### Core: `generateStyle(className, config = chaiConfig)`

- Validates prefix (`chai-` by default)
- Extracts utility type and value
- Resolves style output as object:

```js
{ property: "padding", value: "1rem" }
```

Supported utility types:

- `bg` -> `background-color`
- `text` -> `color`
- `p` -> `padding`
- `m` -> `margin`
- `fs` -> `font-size`
- `w` -> `width`
- `h` -> `height`
- `border` -> `border` (underscores converted to spaces)
- `rounded`, `radius` -> `border-radius`

Returns `null` for unknown type.

### Core: `generateRule(className, config = chaiConfig)`

- Calls `generateStyle(...)`
- Builds selector `.${escapedClassName}`
- Returns rule string:

```css
.chai-p-4 {
  padding: 1rem;
}
```

Returns `null` for unsupported/invalid class.

---

## `src/apply.js`

This file handles stylesheet injection.

### Constant: `STYLE_TAG_ID`

- Runtime style tag id: `chai-runtime-styles`

### `ensureStyleSheet()`

- Finds `<style id="chai-runtime-styles">`
- Creates it if missing
- Returns `styleTag.sheet` (`CSSStyleSheet`)

### `applyRule(sheet, ruleText)`

- Guards empty args
- Calls `sheet.insertRule(ruleText, sheet.cssRules.length)`
- Catches invalid rules and logs a warning instead of crashing

### `applyStyle(element, styleObject)`

Legacy inline application helper retained for compatibility.
Current engine path primarily uses stylesheet rule insertion.

---

## `src/engine.js`

Main runtime coordinator.

### Internal helper: `loadDefaultFont()`

- Injects Inter font `<link>` into document head

### Internal helper: `applyDefaultFont()`

- Sets body font family to `Inter, sans-serif`

### Public API: `startEngine()`

Detailed sequence:

1. Logs `Engine initiated`
2. Registers `DOMContentLoaded` listener
3. On ready:
   - loads default font
   - applies default font to body
   - calls `extractClasses()`
   - builds unique class list with `new Set(...)`
   - gets runtime stylesheet via `ensureStyleSheet()`
   - loops each class -> `generateRule(...)` -> `applyRule(...)`
4. Logs number of generated utility rules

This design avoids re-inserting duplicate CSS for repeated class names.

---

## `src/index.js`

Public module barrel file.

Exports:

- `startEngine`
- `extractClasses`
- `generateStyle`
- `generateRule`
- `applyStyle`
- `ensureStyleSheet`
- `applyRule`
- `chaiConfig`

This lets users import either high-level API or lower-level internals.

---

## `demo/index.html`

Purpose:

- Beginner setup guide
- Utility examples
- Color examples
- Starter template snippet

It imports and runs:

```js
import { startEngine } from "../src/index.js";
startEngine();
```

---

## `index.html` (root)

Purpose:

- Redirect root `/` to `/demo/`
- Prevent 404 when opening `http://localhost:<port>/`

---

## `vite.config.js`

Two main sections:

- `build.lib`
  - Entry: `src/index.js`
  - Name: `ChaiCssEngine`
  - Output formats: `es`, `umd`
  - Output folder: `dist`
- `server.port`
  - Preferred dev port: `5173`
  - Vite auto-falls to next free port if occupied

---

## 8) Utility grammar reference

Base pattern:

```text
chai-<utility>-<value>
```

Examples:

- `chai-bg-red-500`
- `chai-text-slate-700`
- `chai-p-4`
- `chai-fs-xl`
- `chai-w-320`
- `chai-w-50p`
- `chai-w-[37px]`
- `chai-border-1px_solid_#334155`
- `chai-rounded-12`

### Value behavior summary

- Scale lookup first (`4`, `xl`, etc.)
- Numeric becomes `px`
- `p` suffix becomes `%`
- Bracket values are raw passthrough
- Unknown color token falls back to raw CSS color string

---

## 9) How to clean HTML before using this engine

When integrating into a new page:

1. Remove old utility frameworks/classes from markup
2. Keep only semantic HTML + `chai-*` classes
3. Ensure module script imports `startEngine()`
4. Avoid duplicate script bootstraps
5. Verify classes start with configured prefix (`chai-` by default)

Minimal starting template:

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chai App</title>
  </head>
  <body class="chai-bg-slate-50 chai-p-20">
    <h1 class="chai-fs-3xl chai-text-slate-800">Hello Chai</h1>

    <script type="module">
      import { startEngine } from "../src/index.js";
      startEngine();
    </script>
  </body>
</html>
```

---

## 10) Troubleshooting

## `npm run dev` fails with `ENOENT package.json`

Cause: running command in wrong directory.

Fix:

```powershell
cd "...\chai-css-engine"
npm install
npm run dev
```

## `localhost` shows 404

- Use root URL that redirects to demo: `/`
- Or open `/demo/` directly
- Confirm dev server is running on printed port

## Styles do not apply

Check:

1. Class prefix is `chai-` (or your configured prefix)
2. Script imports and runs `startEngine()`
3. No JS errors in browser console
4. Utility type is implemented in `generateStyle()`
5. Value format matches parser rules

## Border utility looks wrong

Use underscore-separated values:

- `chai-border-1px_solid_#334155`

Underscores are converted to spaces by parser.

---

## 11) Extending the engine

### Add a new utility

In `src/generate.js`, add a `case` in `generateStyle`.

Example `opacity` utility:

```js
case "opacity":
  return { property: "opacity", value };
```

Use in HTML:

```html
<div class="chai-opacity-0.7"></div>
```

### Add new color families or shade values

Update `theme.colors` in `src/chai.config.js`.

### Change prefix

Set `prefix` in `src/chai.config.js` (for example `cx`), then classes become `cx-bg-red-500`.

---

## 12) Current limitations

- No variant support (`hover:`, `focus:`, responsive prefixes)
- No automatic re-scan for DOM changes after initial load
- No conflict resolution/layer system beyond insertion order
- Runtime work happens in browser (not precompiled CSS)

---

## 13) Summary

`chai-css-engine` is a modular runtime utility compiler with a simple architecture:

- Scan class names
- Parse tokens
- Generate CSS rules
- Inject rules once into runtime stylesheet

It is intentionally small so the full system is easy to read, debug, and extend.
