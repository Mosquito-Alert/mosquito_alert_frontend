<template>
  <Skeleton v-if="loading" width="16rem" height="2rem" />
  <Message v-else-if="error" severity="error" :closable="false">
    Could not load the available areas.
  </Message>

  <TreeSelect
    v-else-if="areaTree.length"
    v-model="selection"
    v-model:expanded-keys="expandedKeys"
    :options="areaTree"
    selection-mode="single"
    placeholder="Select an area"
    filter
    @filter="onFilter"
    filter-mode="lenient"
    filter-by="name,code"
    filter-placeholder="Search by name or code"
    class="w-full md:w-20rem"
    :disabled="worldMode"
  >
    <!-- Selected value shown in the input -->
    <template #value="{ value, placeholder }">
      <span v-if="value?.length">{{ value[0].name }}</span>
      <span v-else>{{ placeholder }}</span>
    </template>

    <!-- Each row in the dropdown -->
    <template #option="{ node }">
      <span>{{ node.name }}</span>
      <Tag v-if="node.is_member" value="Member" severity="info" class="ml-2" />
    </template>
  </TreeSelect>

  <div v-if="canViewWorld" class="flex items-center gap-2">
    <ToggleSwitch v-model="worldMode" input-id="world-mode" />
    <label for="world-mode">Worldwide</label>
  </div>
</template>
<script setup lang="ts">
import { useStatisticsStore } from '@/stores/statisticsStore'
import { useAbility } from '@casl/vue'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import type { AppAbility } from '../../services/ability.ts'

const statisticsStore = useStatisticsStore()
const {
  areaTree,
  areaSelectedKey: selectedKey,
  loadingArea: loading,
  errorArea: error,
  loadedArea,
  worldMode,
} = storeToRefs(statisticsStore)

const ability = useAbility<AppAbility>()
const canViewWorld = computed(() => ability.can('view', 'WorldStatistics'))

// * ********** Filter Feature **********
let filterTimeout: ReturnType<typeof setTimeout> | null = null
const expandedKeys = ref<Record<string, boolean>>({})
const onFilter = (event: { value: string }) => {
  if (filterTimeout) clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    expandedKeys.value = statisticsStore.ancestorKeysOfMatches(event.value)
  }, 300)
}

const selection = computed({
  get: () => (selectedKey.value ? { [selectedKey.value]: true } : null),
  set: (value: Record<string, boolean> | null) => {
    const key = value ? Object.keys(value)[0] : undefined
    if (key) statisticsStore.select(key) // ignore "unselect", an area is always required
  },
})

// Users with the unrestricted permission but no workspace get an empty tree:
// start them in world mode, since there is no area to select.
watch(loadedArea, (loaded) => {
  if (loaded && !areaTree.value.length && canViewWorld.value) worldMode.value = true
})

onMounted(() => statisticsStore.loadAreas())
</script>
