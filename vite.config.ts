import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig(() => {
  return {
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    },
    base: "/tonenavi/",
    plugins: [
      react(),
      wasm(),
    ],
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
    esbuild: {
      target: "esnext",
    },
    resolve: {
      alias: {
        /** ws は Node.js 専用パッケージ。ブラウザでは実行されないコードパスのため、ネイティブ WebSocket を返すシムに差し替える */
        ws: `${process.cwd()}/src/shims/ws.js`,
      },
    },
    server: {
      host: true,
      port: 8080,
    },
    worker: {
      format: "es" as const,
    },
    build: {
      target: "esnext",
      rollupOptions: {
        /** ws は tsworld バンドル内の Node.js 用コード。ブラウザでは不要なので外部扱いにする */
        external: ["ws"],
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
  };
});
