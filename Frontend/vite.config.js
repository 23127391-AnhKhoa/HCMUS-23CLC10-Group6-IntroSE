import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',              // Cho phép truy cập từ bên ngoài (public IP)
    port: 10000,                  // Cổng chạy server dev
    allowedHosts: ['hcmus-23clc10-group6-introse.onrender.com'], // Cho phép domain Render gọi tới
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // API backend chạy local (trong dev mode)
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,                   // Cổng khi chạy `vite preview`
    host: '0.0.0.0'               // Cho phép truy cập khi preview
  }
})
