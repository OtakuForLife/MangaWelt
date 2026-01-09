import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  let tailwindPlugin: any = null
  try {
    const mod = await import('@tailwindcss/vite')
    tailwindPlugin = mod.default()
  } catch (e) {
    console.warn('Tailwind plugin not loaded, continuing without it:', e)
  }

  return {
    plugins: [
      react(),
      ...(tailwindPlugin ? [tailwindPlugin] : []),
    ],
    base: './', // Use relative paths for Capacitor
    server: {
      port: parseInt(process.env.FRONTEND_PORT || '5173'),
      host: '0.0.0.0',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
