/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setup.ts",
    // Añadimos el reporter JUnit para que vuelque frontend/vitest-report.xml
    reporters: [
      "default",
      ["junit", { outputFile: "frontend/vitest-report.xml" }],
    ],
    // coverage sigue funcionando como antes
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov"],
    },
  },
});
