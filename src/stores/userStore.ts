import { defineStore } from 'pinia'
import type { RawAxiosRequestConfig } from 'axios'

import { userApi } from '@/services/apiService'
import { usePermissionsStore } from './permissionsStore'
import type { User } from 'mosquito-alert'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    async fetchCurrentUser(options?: RawAxiosRequestConfig) {
      try {
        const response = await userApi.retrieveMine(options)
        this.user = response.data as User
      } catch (error) {
        console.error('Failed to fetch user:', error)
        this.clearUser()
        throw error
      }
      try {
        const permissionsStore = usePermissionsStore()
        await permissionsStore.fetchPermissions()
      } catch (error) {
        console.log('Failed to fetch permissions:', error)
      }
    },
    clearUser() {
      this.user = null

      const permissionsStore = usePermissionsStore()
      permissionsStore.clearPermissions()
    },
  },
})
