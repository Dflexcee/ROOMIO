import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react', 'react-icons'],
          charts: ['chart.js', 'react-chartjs-2'],
          motion: ['framer-motion']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
