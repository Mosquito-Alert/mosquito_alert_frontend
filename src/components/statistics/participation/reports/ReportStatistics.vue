<template>
  <div>
    <h3 class="card-title my-8">{{ where }} Report Statistics</h3>

    <!-- * GENERAL INFORMATION -->
    <div class="mt-4 mb-8">
      <p>
        Statistics about the <strong>published</strong> reports in <strong>{{ where }}</strong> for
        <strong>{{ when }}</strong
        >.
      </p>
      <p>
        This section provides an overview of the report statistics. There are three types of
        reports: adult observations, bites and breeding sites.
      </p>
    </div>

    <!-- * CHARTS -->
    <div>
      <TypeBreakdownReportStatistics />
      <Divider class="my-4" />
      <ByTypeReportStatistics />
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Divider from 'primevue/divider'
import { computed } from 'vue'
import { useStatisticsStore } from '../../../../stores/statisticsStore.ts'
import ByTypeReportStatistics from './ByTypeReportStatistics.vue'
import TypeBreakdownReportStatistics from './TypeBreakdownReportStatistics.vue'

const statisticsStore = useStatisticsStore()
const { dateFrom, dateTo, selectedArea, worldMode } = storeToRefs(statisticsStore)

const where = computed(() => (worldMode.value ? 'the world' : selectedArea.value?.name || ''))
const when = computed(() =>
  dateFrom.value && dateTo.value ? `${dateFrom.value} - ${dateTo.value}` : 'all time',
)
</script>
