import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/users': 'http://localhost:3000',
      '/tasks': 'http://localhost:3000',
      '/office-in-out': 'http://localhost:3000',
      '/login': 'http://localhost:3000', // Added proxy for login
    },
  },
})
