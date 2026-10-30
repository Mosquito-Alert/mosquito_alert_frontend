<template>
  <div>
    <h3 class="card-title my-4">Report Statistics</h3>
    <GlobalReportStatistics />
    <hr class="my-8" />
    <ByTypeReportStatistics />
  </div>
</template>
<script setup lang="ts">
import ByTypeReportStatistics from './ByTypeReportStatistics.vue'
import GlobalReportStatistics from './GlobalReportStatistics.vue'
</script>
