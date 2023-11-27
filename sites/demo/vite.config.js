import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  return {
    plugins: [react()],
    esbuild: {
      loader: "jsx",
      include: /\/src\/.*\.js$/,
      exclude: [],
    },
    resolve: {
      alias: {
        "@haniffalab/cherita-react": path.resolve(
          __dirname,
          "../../src/lib/index.js"
        ),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { ".js": "jsx" },
      },
    },
    define: {
      "process.env": {...process.env, ...loadEnv(mode, process.cwd(), "")},
    },
  }
});
