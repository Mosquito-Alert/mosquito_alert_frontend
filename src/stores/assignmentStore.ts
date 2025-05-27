import { defineStore } from 'pinia'
import type { Assignment } from 'mosquito-alert'
import { identificationTasksApi } from '@/services/apiService'

export const useAssignmentStore = defineStore('assignment', {
  state: () => ({
    assignment: null as Assignment | null,
  }),
  actions: {
    async fetchNewAssignment() {
      try {
        const response = await identificationTasksApi.assignNext()
        this.assignment = response.data
      } catch (error) {
        console.error('Failed to fetch new assignment:', error)
        throw error
      }
    },
  },
  getters: {
    getAssignmentById: (state) => {
      return (uuid: string) => {
        if (state.assignment?.observation.uuid === uuid) {
          return state.assignment
        }
        return null
      }
    },
  },
})
