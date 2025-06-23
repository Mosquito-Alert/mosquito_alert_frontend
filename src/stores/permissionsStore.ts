import { defineStore } from 'pinia'
import type { RawAxiosRequestConfig } from 'axios'

import defineAbilityFor from '@/services/ability'
import { permissionsApi } from '@/services/apiService'
import type { UserPermission } from 'mosquito-alert'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    ability: defineAbilityFor(null),
    permission: null as UserPermission | null,
  }),
  actions: {
    async fetchPermissions(options?: RawAxiosRequestConfig) {
      try {
        const response = await permissionsApi.retrieveMine(options)
        this.permission = response.data as UserPermission
        this.ability.update(defineAbilityFor(this.permission).rules)
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
        this.clearPermissions()
        throw error
      }
    },
    clearPermissions() {
      this.permission = null
      this.ability.update(defineAbilityFor(null).rules)
    },
  },
})
