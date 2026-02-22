import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // v4: replaces postcss.config.js entirely
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "HWLAssistant",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      // Externalize React so the host app's version is used, not a bundled copy
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    // Generate source maps for easier debugging by consumers
    sourcemap: true,
    // Keep class names for Tailwind CSS to work correctly
    minify: "esbuild",
  },
});
