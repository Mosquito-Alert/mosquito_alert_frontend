<template>
  <div class="card">
    <h2 class="card-title m-0">Citizen Participation Statistics</h2>
    <!-- * FILTERS -->
    <div class="statistics-filters flex flex-row gap-4">
      <AreaSelector />
      <DateRangePickerWithPresets />
    </div>

    <!-- * GENERAL INFORMATION -->
    <div class="mt-4 mb-8">
      <p>
        This section provides general information about citizen participation statistics. You can
        filter above using the area selector and date range picker.
      </p>
      <div class="card bg-red-100! m-4">
        <p>
          The data used in the preparation of this page is for internal use and restricted to users
          who have been granted access. Please do not share or distribute it.
        </p>
        <p>
          If you are interested in obtaining public data from Mosquito Alert, you can use the data
          download features of the
          <a target="_blank" href="https://map.mosquitoalert.com" class="text-blue-500 underline!"
            >Public Map</a
          >, or use the data available on the
          <a
            target="_blank"
            href="https://labs.mosquitoalert.com/metadata_public_portal/README.html"
            class="text-blue-500 underline!"
            >Mosquito Alert Data Portal</a
          >.
        </p>
        <p class="flex flex-row items-center">
          Most of the data accessible from these sources (the Public Map and Data Portal) is
          distributed under the Creative Commons Zero license
          <a
            rel="license"
            target="_blank"
            href="https://creativecommons.org/publicdomain/zero/1.0/deed.es_ES"
            class="ml-2"
            ><img
              alt="Licencia Creative Commons Zero"
              style="border-width: 0"
              src="http://i.creativecommons.org/p/zero/1.0/88x31.png"
          /></a>
        </p>
      </div>
    </div>

    <!-- * INDEX -->
    <!-- TODO:  -->
    <!-- TODO: Also, make foldable sections for each index item -->

    <!-- * PARTICIPATION CHARTS -->
    <ReportStatistics />
    <!-- TODO: Sampling Effort charts -->
    <!-- TODO: User Downloads charts -->
    <!-- TODO: User profiling charts -->
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import AreaSelector from '@/components/statistics/AreaSelector.vue'
import DateRangePickerWithPresets from '@/components/statistics/DateRangePickerWithPresets.vue'
import { useStatisticsStore } from '@/stores/statisticsStore'
import ReportStatistics from '../../components/statistics/participation/reports/ReportStatistics.vue'

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
