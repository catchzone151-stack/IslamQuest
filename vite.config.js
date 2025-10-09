import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Replit-compatible Vite config
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // allow external access
    port: 5000, // Replit’s open port
  },
});
