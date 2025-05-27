import { defineStore } from 'pinia'
import { taxaApi } from '@/services/apiService'
import type { TaxonTreeNode, Taxon } from 'mosquito-alert'

export const useTaxaStore = defineStore('taxa', {
  state: () => ({
    treeNode: null as TaxonTreeNode | null,
    relevant: [] as Taxon[],
  }),
  actions: {
    async fetchTaxaTree() {
      try {
        const response = await taxaApi.rootTreeRetrieve()
        this.treeNode = response.data
      } catch (error) {
        console.error('Failed to fetch taxa tree:', error)
        throw error
      }
    },
    async fetchRelevant() {
      try {
        let page = 1
        const allRelevant = []
        let hasNextPage = true

        while (hasNextPage) {
          const response = await taxaApi.list({ page: page, isRelevant: true })
          allRelevant.push(...(response.data.results ?? []))
          hasNextPage = response.data.next !== null
          page += 1
        }

        this.relevant = allRelevant
      } catch (error) {
        console.error('Failed to fetch relevat taxa:', error)
        throw error
      }
    },
  },
})
