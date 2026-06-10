import { defineStore } from 'pinia'
import { workspaceApi } from '@/services/apiService'
import type { Workspace, WorkspaceCollaborationGroup } from 'mosquito-alert'

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    workspaces: [] as Workspace[],
    workspaceCollaborationGroups: [] as WorkspaceCollaborationGroup[],
  }),
  actions: {
    async fetchWorkspaces() {
      try {
        let page = 1
        const allWorkspaces = []
        let hasNextPage = true

        while (hasNextPage) {
          const response = await workspaceApi.listMine({ page: page })
          allWorkspaces.push(...(response.data.results ?? []))
          hasNextPage = response.data.next !== null
          page += 1
        }

        this.workspaces = allWorkspaces
      } catch (error) {
        console.error('Failed to fetch workspaces:', error)
        throw error
      }
    },
    async fetchWorkspaceCollaborationGroups() {
      try {
        const response = await workspaceApi.collaborationsListMine()
        this.workspaceCollaborationGroups = response.data.results ?? []
      } catch (error) {
        console.error('Failed to fetch workspace collaboration groups:', error)
        throw error
      }
    },
    clear() {
      this.workspaces = []
      this.workspaceCollaborationGroups = []
    },
  },
})
