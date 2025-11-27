import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Use '/' for extension and web deployment (nginx serves from root)
  base: process.env.BUILD_TARGET === 'extension' ? '/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-select', '@radix-ui/react-slider'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // For extensions, copy manifest.json and icons to dist
    copyPublicDir: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@radix-ui/react-select', '@radix-ui/react-slider'],
  },
})
