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
          return chunk.name === 'contentScript' ? 'contentScript.js' : 'assets/[name]-[hash].js'
        }
      }
    }
  },
  base: './',
})