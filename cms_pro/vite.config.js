import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['community-management-system-final-wjfi.onrender.com', 'community-management-system-final-9bku.onrender.com'],
    port: process.env.PORT || 4173
  }
})
