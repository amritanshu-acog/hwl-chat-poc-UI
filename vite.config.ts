import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Standard SPA build — NOT a library.
// The widget/library build config has been removed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Dev server
  server: {
    port: 5173,
    open: true,
  },
});
