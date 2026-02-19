import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { Pinia } from 'pinia'

import * as Sentry from '@sentry/vue'
import { createSentryPiniaPlugin } from '@sentry/vue'

import { apiUrl } from './apiService'

export function initSentry(app: App, router: Router, pinia: Pinia) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    integrations: [Sentry.browserTracingIntegration({ router })],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
    tracePropagationTargets: ['localhost', apiUrl],
    environment: import.meta.env.MODE,
  })

  pinia.use(createSentryPiniaPlugin())
}
