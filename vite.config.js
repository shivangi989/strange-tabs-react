import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
   plugins: [tailwindcss(),react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        contentScript: 'src/contentScript.js',  // separate bundle
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'contentScript') return 'contentScript.js'
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  base: './',
})