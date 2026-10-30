<template>
  <div class="flex flex-wrap items-center justify-between gap-3 my-8">
    <h4 class="card-title m-0">Filtered By Report Type Statistics</h4>
    <SelectButton
      v-model="selectedType"
      :options="typeOptions"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      aria-label="Report type"
    />
  </div>

  <Message v-if="error" severity="error" :closable="false">Could not load the statistics.</Message>

  <Message v-else-if="!regionLevel" severity="info" :closable="false">
    This area has no subdivisions to compare.
  </Message>

  <div v-else class="grid grid-cols-12 gap-4">
    <Card class="col-span-12 lg:col-span-6">
      <template #title>{{ typeInfo.label }} by region</template>
      <template #content>
        <v-chart :option="barOption" :loading="loading" autoresize :style="{ height: barHeight }" />
      </template>
    </Card>

    <Card class="col-span-12 lg:col-span-6">
      <template #title>Cumulative {{ typeInfo.label.toLowerCase() }} over time</template>
      <template #content>
        <v-chart :option="areaOption" :loading="loading" autoresize style="height: 340px" />
      </template>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { useStatisticsStore } from '@/stores/statisticsStore'
import {
  STATS_REPORTS_TYPES,
  formatNumber,
  getSubRegionLevel,
  pickInterval,
  stackedTooltip,
  type TypeKey,
} from '@/utils/statsChartsUtils'
import { StatsReportsListGroupByParameter, type ReportStatsRow } from 'mosquito-alert'
import { statsApi } from '../../../../services/apiService'

use([CanvasRenderer, BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent])

const statisticsStore = useStatisticsStore()
const { selectedArea, dateFrom, dateTo } = storeToRefs(statisticsStore)

const selectedType = ref<TypeKey>('adult')
const typeOptions = STATS_REPORTS_TYPES.map((t) => ({ label: t.label, value: t.key }))
const typeInfo = computed(() => STATS_REPORTS_TYPES.find((t) => t.key === selectedType.value)!)

const byRegion = ref<ReportStatsRow[]>([])
const byRegionDate = ref<ReportStatsRow[]>([])
const loading = ref(false)
const error = ref(false)

// `level` must be strictly finer than the area's level; NUTS3 has nothing below.
const regionLevel = computed(() => getSubRegionLevel(selectedArea.value))

let requestId = 0
async function load() {
  const area = selectedArea.value
  if (!area || !regionLevel.value || !dateFrom.value || !dateTo.value) {
    byRegion.value = []
    byRegionDate.value = []
    return
  }

  const id = ++requestId // ignore responses from superseded requests
  loading.value = true
  error.value = false

  const base = {
    area: area.key,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    type: [selectedType.value],
    level: regionLevel.value,
  }
  try {
    const [a, b] = await Promise.all([
      statsApi.reportsList({ ...base, groupBy: [StatsReportsListGroupByParameter.Region] }),
      statsApi.reportsList({
        ...base,
        groupBy: [StatsReportsListGroupByParameter.Region, StatsReportsListGroupByParameter.Date],
        interval: pickInterval(dateFrom.value, dateTo.value, 62, 365),
        cumulative: true,
      }),
    ])
    if (id !== requestId) return
    byRegion.value = a.data.data as ReportStatsRow[]
    byRegionDate.value = b.data.data as ReportStatsRow[]
  } catch {
    if (id === requestId) error.value = true
  } finally {
    if (id === requestId) loading.value = false
  }
}

watch([selectedArea, dateFrom, dateTo, selectedType], load, { immediate: true })

// * ################# CHARTS #################
// ---------- 1. Horizontal bars by region ----------
const sortedRegions = computed(() =>
  // ascending: ECharts draws the first category at the bottom
  [...byRegion.value].sort((a, b) => a.count - b.count),
)

const barHeight = computed(() => `${Math.max(240, sortedRegions.value.length * 28 + 80)}px`)

const barOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    confine: true,
    formatter: (params: any) => {
      const p = Array.isArray(params) ? params[0] : params
      return `${p.axisValueLabel}<br/>${p.marker}${typeInfo.value.label}: <b>${formatNumber(p.value ?? 0)}</b>`
    },
  },
  grid: { left: 8, right: 24, top: 16, bottom: 8, containLabel: true },
  xAxis: { type: 'value', axisLabel: { formatter: (v: number) => formatNumber(v) } },
  yAxis: { type: 'category', data: sortedRegions.value.map((r) => r.region_name ?? '') },
  series: [
    {
      name: typeInfo.value.label,
      type: 'bar',
      itemStyle: { color: typeInfo.value.color },
      data: sortedRegions.value.map((r) => r.count),
    },
  ],
}))

// ---------- 2. Cumulative stacked area, one area per region ----------
const dates = computed(() => [...new Set(byRegionDate.value.map((r) => r.date!))].sort())

const areaSeries = computed(() => {
  const index = new Map(dates.value.map((d, i) => [d, i]))

  // region_id -> { name, data[] }, one slot per date
  const regions = new Map<number, { name: string; data: number[] }>()
  for (const r of byRegionDate.value) {
    const { date, count } = r
    const region_id = r.region_id as number
    const region_name = r.region_name as string
    let entry = regions.get(region_id)
    if (!entry) {
      entry = { name: region_name, data: new Array(dates.value.length).fill(0) }
      regions.set(region_id, entry)
    }
    entry.data[index.get(date!)!] = count
  }

  return (
    [...regions.values()]
      // This sorting will order the regions by their final cumulative value in descending order
      // .sort((a, b) => b.data.at(-1)! - a.data.at(-1)!)
      .map(({ name, data }) => ({
        name,
        data,
        type: 'line' as const,
        stack: 'total',
        areaStyle: { opacity: 0.7 },
        showSymbol: false,
        emphasis: { focus: 'series' as const },
      }))
  )
})

const areaOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', confine: true, formatter: stackedTooltip },
  legend: { type: 'scroll', top: 0 },
  grid: { left: 8, right: 24, top: 40, bottom: 8, containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: dates.value },
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => formatNumber(v) } },
  series: areaSeries.value,
}))
</script>
