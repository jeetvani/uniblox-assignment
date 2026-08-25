import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      exclude: [
        "src/components/ui/**",
        "src/main.tsx",
        "src/test/**",
        "src/vite-env.d.ts",
      ],
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        branches: 70,
        functions: 75,
        lines: 80,
        statements: 80,
      },
    },
    css: true,
    env: {
      VITE_API_BASE_URL: "http://localhost",
    },
    environment: "jsdom",
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
  },
})
