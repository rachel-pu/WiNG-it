import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
   server: {
    port: 3000,
    strictPort: true 
  }
})
