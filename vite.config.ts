import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

function vendorChunk(id: string): string | undefined {
  if (!id.includes("node_modules")) return;

  if (id.includes("apexcharts") || id.includes("vue3-apexcharts")) {
    return "vendor-charts";
  }
  // Only the core `leaflet` package — plugins (markercluster, heat) expect
  // global `L` and must not run when unrelated routes import `leaflet` alone.
  if (/node_modules\/leaflet\//.test(id)) {
    return "vendor-leaflet";
  }
  if (id.includes("reka-ui") || id.includes("@vueuse")) {
    return "vendor-ui";
  }
  if (
    id.includes("/vue/") ||
    id.includes("vue-router") ||
    id.includes("pinia") ||
    id.includes("@vue/")
  ) {
    return "vendor-vue";
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    ...(command === "serve"
      ? [
          // Cursor uses the `cursor` CLI, not `code` (VS Code). Install via:
          // Command Palette → "Shell Command: Install 'cursor' command in PATH"
          vueDevTools({
            launchEditor: process.env.LAUNCH_EDITOR ?? "cursor",
          }),
        ]
      : []),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // ApexCharts is ~1 MB minified; loaded only on the dashboard route
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      onLog(level, log, defaultHandler) {
        // Harmless upstream VueUse + Rolldown pure-annotation mismatch
        if (log.code === "INVALID_ANNOTATION") return;
        defaultHandler(level, log);
      },
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
}));
