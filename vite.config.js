import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        post1: resolve(__dirname, 'blog/install-openpilot-toyota-corolla.html'),
        post2: resolve(__dirname, 'blog/openpilot-vs-tesla-autopilot-vs-gm-super-cruise.html'),
        post3: resolve(__dirname, 'blog/best-evs-under-30000-openpilot-2025.html'),
      },
    },
  },
})
