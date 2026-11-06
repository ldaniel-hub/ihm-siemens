import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    federation({
      name: "smart40",
      filename: "remoteEntry.js",
      exposes: { ".": "./src/ModuleBridge.tsx" },
      dts: false,
    }),
  ],
});