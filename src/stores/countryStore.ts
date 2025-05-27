import { defineStore } from 'pinia'
import { countryApi } from '@/services/apiService'
import type { Country } from 'mosquito-alert'

export const useCountryStore = defineStore('country', {
  state: () => ({
    countries: [] as Country[],
  }),
  actions: {
    async fetchCountries() {
      try {
        let page = 1
        const allCountries = []
        let hasNextPage = true

        while (hasNextPage) {
          const response = await countryApi.list({ page: page })
          allCountries.push(...(response.data.results ?? []))
          hasNextPage = response.data.next !== null
          page += 1
        }

        this.countries = allCountries
      } catch (error) {
        console.error('Failed to fetch coutnries:', error)
        throw error
      }
    },
  },
})
