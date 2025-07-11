import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Chuỗi '/api' là tiền tố của các request API bạn muốn chuyển tiếp
      '/api': {
        target: 'http://localhost:8000', // Đổi thành địa chỉ backend của bạn nếu khác
        changeOrigin: true,
      }
    }
  }
})
