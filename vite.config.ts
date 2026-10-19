import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The site is deployed at the domain root, so generated asset URLs must remain root-absolute.
  base: '/',
  plugins: [react()],
  server: { host: true, port: 5173 },
})
