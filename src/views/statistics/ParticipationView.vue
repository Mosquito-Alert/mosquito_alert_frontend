<template>
  <div>
    <h1>Citizen Participation Statistics</h1>
    <AreaSelector />
  </div>
</template>
<script setup lang="ts">
import AreaSelector from '@/components/statistics/AreaSelector.vue'
import { useStatisticsStore } from '@/stores/statisticsStore'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

const { areaSelectedKey } = storeToRefs(useStatisticsStore())

// null until the areas load, so skip fetching until there is a key.
watch(
  areaSelectedKey,
  (areaSelectedKey) => {
    // if (areaSelectedKey) fetchCharts(areaSelectedKey)
  },
  { immediate: true },
)
</script>
