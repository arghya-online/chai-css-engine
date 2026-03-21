import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "ChaiCssEngine",
      fileName: "chai-css-engine",
      formats: ["es", "umd"],
    },
    outDir: "dist",
  },
  server: {
    port: 5173,
  },
});
