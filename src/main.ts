import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { abilitiesPlugin } from '@casl/vue'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import FocusTrap from 'primevue/focustrap'

import App from './App.vue'
import router from './router'

import 'leaflet/dist/leaflet.css'

import '@/assets/css/styles.scss'
import '@/assets/css/tailwind.css'

import '@/assets/css/flags/css/flag-css.css'
import { useUserStore } from './stores/userStore'
import { useAuthStore } from './stores/authStore'
import { usePermissionsStore } from './stores/permissionsStore'

import { initSentry } from './services/sentry'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
// Initialize the user on app start

const MosquitoAlertPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{yellow.50}',
      100: '{yellow.100}',
      200: '{yellow.200}',
      300: '{yellow.300}',
      400: '{yellow.400}',
      500: '{yellow.500}',
      600: '{yellow.600}',
      700: '{yellow.700}',
      800: '{yellow.800}',
      900: '{yellow.900}',
      950: '{yellow.950}',
    },
  },
})

app.use(PrimeVue, {
  theme: {
    preset: MosquitoAlertPreset,
    // options: {
    //   cssLayer: {
    //     name: 'primevue',
    //     order: 'theme, base, primevue, utilities',
    //   },
    // },
  },
})
app.use(ToastService)
app.use(ConfirmationService)
app.directive('focustrap', FocusTrap)

initSentry(app, router, pinia)

async function initUser() {
  const userStore = useUserStore()
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && !userStore.user) {
    try {
      await userStore.fetchCurrentUser({ timeout: 1000 })
    } catch {
      authStore.logout()
    }
  }
}

const permissionsStore = usePermissionsStore()

app.use(abilitiesPlugin, permissionsStore.ability, {
  useGlobalProperties: true,
})

initUser().finally(() => {
  app.use(router)
  app.mount('#app')
})
