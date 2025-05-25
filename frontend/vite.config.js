import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // zostaw
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
        rewrite: (path) => path, 
      },
    },
    allowedHosts: "all",
  },
});
