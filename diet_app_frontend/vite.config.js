import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 🔽 ここから追加
  test: {
    environment: 'jsdom',
    globals: true,
  }
  // 🔼 ここまで追加
})