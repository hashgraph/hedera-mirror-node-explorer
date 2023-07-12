import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import pluginRewriteAll from 'vite-plugin-rewrite-all'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    basicSsl(),
    pluginRewriteAll(), // See vite issue: https://github.com/vitejs/vite/issues/2190
    nodePolyfills({ // hashgraph/proto needs NodeJS buffers
      exclude: [
        'fs', // Excludes the polyfill for `fs` and `node:fs`.
      ],
      globals: {
        Buffer: true,
        global: false,
        process: false,
      },
      protocolImports: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
