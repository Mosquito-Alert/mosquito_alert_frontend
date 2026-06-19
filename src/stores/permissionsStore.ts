import { defineStore } from 'pinia'
import type { RawAxiosRequestConfig } from 'axios'

import defineAbilityFor from '@/services/ability'
import { permissionsApi } from '@/services/apiService'
import type { Permissions } from 'mosquito-alert'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    ability: defineAbilityFor(null),
    permissions: null as Permissions | null,
  }),
  actions: {
    async fetchPermissions(options?: RawAxiosRequestConfig) {
      try {
        const response = await permissionsApi.retrieveMine(options)
        this.permissions = response.data as Permissions
        this.ability.update(defineAbilityFor(this.permissions).rules)
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
        this.clearPermissions()
        throw error
      }
    },
    clearPermissions() {
      this.permissions = null
      this.ability.update(defineAbilityFor(null).rules)
    },
  },
})
