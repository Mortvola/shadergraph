import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { "version": "2023-11" }]
        ]
      }
    }),
    viteTsconfigPaths(),
  ],
  server: {
    open: true,
    port: 3000,
    proxy: {
      '/fonts': 'http://localhost:3333',
      '/api': 'http://localhost:3333'
    }
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
})

