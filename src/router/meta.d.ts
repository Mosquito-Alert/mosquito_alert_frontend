import 'vue-router'
import type { Actions, Subjects } from '@/services/ability'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAbility?: [Actions, Subjects]
  }
}
