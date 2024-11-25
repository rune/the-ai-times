import path from "node:path"
import rune from "rune-sdk/vite"
import { dataUrl } from 'vite-plugin-data-url'
import { defineConfig } from "vite"
import { qrcode } from "vite-plugin-qrcode"

// https://vitejs.dev/config/
export default defineConfig({
  base: "", // Makes paths relative
  plugins: [
    dataUrl({ limit: 1000000 }),
    qrcode(), // only applies in dev mode
    rune({
      logicPath: path.resolve("./src/logic.ts"),
      minifyLogic: false, // This flag can be used if your logic reaches the allowed limit. However, it will make it significantly more difficult to detect validation issues
      ignoredDependencies: [],
    }),
  ],
})
