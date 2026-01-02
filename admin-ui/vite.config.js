import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/admin/', // Important: Admin runs at /admin subpath
  build: {
    outDir: '../dist/admin', // Build directly into the main worker assets
    emptyOutDir: true
  }
})