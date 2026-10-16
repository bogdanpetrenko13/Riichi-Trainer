import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

// Relative base so the build works from Capacitor's local server and file://.
export default defineConfig({
  base: "./",
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react()],
  // The ported CRA code keeps JSX in .js files until it moves to .tsx.
  esbuild: { loader: "tsx", include: /src\/.*\.[jt]sx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  build: { target: "es2020", outDir: "dist", assetsInlineLimit: 0, chunkSizeWarningLimit: 900 },
});
