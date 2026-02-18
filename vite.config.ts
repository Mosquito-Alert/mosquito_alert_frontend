import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  // load .env files based on current mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    build: {
      sourcemap: true, // Source map generation must be turned on
    },
    server: {
      ...(isDev && {
        proxy: {
          '/api': {
            target: 'https://webdev.mosquitoalert.com/api/v1/',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        },
      }),
    },
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      tailwindcss(),
      Components({
        resolvers: [PrimeVueResolver()],
      }),
      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        authToken: env.SENTRY_AUTH_TOKEN,
        org: 'mosquito-alert',
        project: 'mosquito_alert_frontend',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
