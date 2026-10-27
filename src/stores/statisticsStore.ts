import { AreaMetaLevel, type StatsArea } from 'mosquito-alert'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { statsApi } from '../services/apiService'
import { normalize } from '../utils/Utils'

const flatten = (nodes: StatsArea[]): StatsArea[] =>
  nodes.flatMap((n) => [n, ...flatten(n.children)])

export const useStatisticsStore = defineStore('statistics', () => {
  // ! #################### State ####################
  // Filters date range
  const dateFrom = ref<string | null>(null)
  const dateTo = ref<string | null>(null)
  // * ********** Area State **********
  const areaTree = ref<StatsArea[]>([])
  const areaSelectedKey = ref<string | null>(null)
  const loadingArea = ref(false)
  const loadedArea = ref(false)
  const errorArea = ref<unknown>(null)

  // ! #################### Getters ####################
  // * ********** Area State **********
  const flat = computed(() => flatten(areaTree.value))
  const selectedArea = computed(
    () => flat.value.find((a) => a.key === areaSelectedKey.value) ?? null,
  )
  // The default area that the user should see: first a member area, then Spain if available, else the first root.
  const defaultArea = computed(
    () =>
      flat.value.find((a) => a.is_member) ??
      flat.value.find((a) => a.key === `${AreaMetaLevel.Country}:ES`) ??
      areaTree.value[0] ??
      null,
  )

  // ! #################### Actions ####################
  const setDateRange = (from: string | null, to: string | null) => {
    dateFrom.value = from
    dateTo.value = to
  }
  // * ********** Area State **********
  // Idempotent: safe to call from every component that needs the areas.
  const loadAreas = async (force = false) => {
    if (loadedArea.value && !force) return
    loadingArea.value = true
    errorArea.value = null
    try {
      const { data } = await statsApi.areasList()
      areaTree.value = data
      loadedArea.value = true
      // Keep the current selection if it is still valid, otherwise use the default.
      if (!flat.value.some((a) => a.key === areaSelectedKey.value)) {
        areaSelectedKey.value = defaultArea.value?.key ?? null
      }
    } catch (e) {
      errorArea.value = e
    } finally {
      loadingArea.value = false
    }
  }

  // Select an area by its key if it exists.
  const select = (key: string) => {
    if (flat.value.some((a) => a.key === key)) areaSelectedKey.value = key
  }

  // Keys of every ancestor of a node matching the query. Useful for expanding the tree to show matches.
  // Example: ancestorKeysOfMatches('lugo') --> {country:ES: true, nuts2:1614: true} which 1614 is the key of Galicia.
  const ancestorKeysOfMatches = (query: string): Record<string, boolean> => {
    const q = normalize(query.trim())
    const keys: Record<string, boolean> = {}
    if (!q) return keys

    const visit = (nodes: StatsArea[]): boolean => {
      let anyMatch = false
      for (const n of nodes) {
        const selfMatches = normalize(n.name).includes(q) || n.code.toLowerCase().includes(q)
        const childMatches = visit(n.children)
        if (childMatches) keys[n.key] = true // open this node so the match is visible
        anyMatch ||= selfMatches || childMatches
      }
      return anyMatch
    }
    visit(areaTree.value)
    return keys
  }

  // ! RESET
  const $reset = () => {
    dateFrom.value = null
    dateTo.value = null
    areaTree.value = []
    areaSelectedKey.value = null
    loadedArea.value = false
    errorArea.value = null
  }

  return {
    dateFrom,
    dateTo,
    setDateRange,
    areaTree,
    areaSelectedKey,
    loadingArea,
    loadedArea,
    errorArea,
    flat,
    selectedArea,
    defaultArea,
    loadAreas,
    select,
    ancestorKeysOfMatches,
    $reset,
  }
})
