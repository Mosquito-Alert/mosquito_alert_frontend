import { defineStore } from 'pinia'
import { identificationTasksApi } from '@/services/apiService'
import {
  IdentificationtasksListOrderByParameter,
  IdentificationtasksListReviewActionParameter,
  IdentificationTaskStatus,
  type IdentificationTask,
} from 'mosquito-alert'

export const useIdentificationTaskStore = defineStore('identificationTask', {
  state: () => ({
    identificationTaskToReview: null as IdentificationTask | null,
  }),
  actions: {
    async fetchNextIdentificationTasksToReview() {
      try {
        const response = await identificationTasksApi.list({
          pageSize: 1,
          orderBy: [IdentificationtasksListOrderByParameter.MinusCreatedAt],
          reviewAction: IdentificationtasksListReviewActionParameter.Null,
          status: [
            IdentificationTaskStatus.Conflict,
            IdentificationTaskStatus.Review,
            IdentificationTaskStatus.Done,
          ],
        })
        this.identificationTaskToReview = response.data.results?.[0] ?? null
      } catch (error) {
        console.error('Failed to fetch identification tasks:', error)
        throw error
      }
    },
  },
})
