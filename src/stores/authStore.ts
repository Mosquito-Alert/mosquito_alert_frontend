import { defineStore } from 'pinia'

import { authApi } from '@/services/apiService'
import type { AuthApiObtainTokenRequest } from 'mosquito-alert'

import { useUserStore } from './userStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({}),
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await authApi.obtainToken({
          appUserTokenObtainPairRequest: {
            username: username,
            password: password,
          },
        } as AuthApiObtainTokenRequest)
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)

        // Load user info after login
        const userStore = useUserStore()
        await userStore.fetchCurrentUser()
      } catch (error) {
        console.error('Login failed:', error)
        // Handle login error (e.g., show a notification)
        throw error
      }
    },
    logout() {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      const userStore = useUserStore()
      userStore.clearUser()
    },
  },
  getters: {
    isAuthenticated: () => !!localStorage.getItem('access_token'),
  },
})
