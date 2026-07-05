import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": "http://178.105.189.230",
    },
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("@mui/x-data-grid")) return "vendor-datagrid";
          if (id.includes("@mui/x-charts") || id.includes("recharts"))
            return "vendor-charts";
          if (
            id.includes("@mui/x-date-pickers") ||
            id.includes("dayjs") ||
            id.includes("date-fns")
          )
            return "vendor-date";
          if (id.includes("jspdf") || id.includes("html2canvas"))
            return "vendor-pdf";
          if (id.includes("@mui") || id.includes("@emotion"))
            return "vendor-mui";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("react-dom") || id.includes("/react/"))
            return "vendor-react";

          return "vendor";
        },
      },
    },
  },
});
