<template>
  <div class="card">
    <h2 class="card-title m-0">Citizen Participation Statistics</h2>
    <div class="statistics-filters flex flex-row">
      <AreaSelector />
      <DateRangePickerWithPresets />
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { watch, ref } from 'vue'
import AreaSelector from '@/components/statistics/AreaSelector.vue'
import DateRangePickerWithPresets from '@/views/statistics/DateRangePickerWithPresets.vue'
import { useStatisticsStore } from '@/stores/statisticsStore'

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
