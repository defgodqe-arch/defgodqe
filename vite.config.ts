/// <reference path="./vite.config.d.ts" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import fs from "node:fs";
import path from "node:path";

/**
 * The main defgodqe UI is the existing legacy/static app. Several features
 * intentionally load browser scripts by filename at runtime, so emit every
 * root-level JavaScript asset into the production bundle as well as the
 * normal Vite module graph.
 */
function copyLegacyRuntimeAssets(): Plugin {
  return {
    name: "defgodqe-copy-legacy-runtime-assets",
    generateBundle(this: any) {
      const root = process.cwd();
      const files = fs.readdirSync(root, { withFileTypes: true })
        .filter((entry: any) => entry.isFile() && entry.name.endsWith(".js"))
        .map((entry: any) => entry.name)
        .filter((name: string) => name !== "app.js");

      for (const name of files) {
        this.emitFile({
          type: "asset",
          fileName: name,
          source: fs.readFileSync(path.join(root, name), "utf8"),
        });
      }
    },
  };
}

export default defineConfig({
  optimizeDeps: {
    exclude: ["hono", "hono/cors"],
  },
  plugins: [
    react(),
    copyLegacyRuntimeAssets(),
    cloudflare({ remoteBindings: false }),
  ],
});
