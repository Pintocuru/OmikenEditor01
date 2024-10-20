// vite.config.mjs
// Plugins
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls }
    }),
    Vuetify(),
    Components(),
    ViteFonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.ts',
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.tsx',
      '.vue',
    ],
  },
  build: {
    minify: false, // ミニファイを無効化
    lib: {
      entry: {
        'test': 'src/test.vue',
      },
      formats: ['es', 'cjs', 'umd', 'iife'], // ESモジュールとUMD形式で出力
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      name: 'MyLibrary', // グローバル変数名を指定（任意の名前）
    },
    rollupOptions: {
      external: ['vue', 'vuetify'],
      output: {
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
        },
      },
    },
    sourcemap: true, // ソースマップを生成
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
