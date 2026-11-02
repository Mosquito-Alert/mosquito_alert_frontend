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

  <Message v-else-if="!regionBreakdown" severity="info" :closable="false">
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
import { useLatestRequest } from '@/composables/useLatestRequest'
import { useStatisticsStore } from '@/stores/statisticsStore'
import {
  STATS_REPORTS_TYPES,
  TOP_N,
  formatNumber,
  getSubRegionLevel,
  pickInterval,
  stackedTooltip,
  topWithOthers,
  type RankedEntry,
  type TypeKey,
} from '@/utils/statsChartsUtils'
import { StatsReportsListGroupByParameter, type ReportStatsRow } from 'mosquito-alert'
import { statsApi } from '../../../../services/apiService'

use([CanvasRenderer, BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent])

const statisticsStore = useStatisticsStore()
const { dateFrom, dateTo, areaParam, scopeReady, regionBreakdown, worldMode } =
  storeToRefs(statisticsStore)

const selectedType = ref<TypeKey>('adult')
const typeOptions = STATS_REPORTS_TYPES.map((t) => ({ label: t.label, value: t.key }))
const typeInfo = computed(() => STATS_REPORTS_TYPES.find((t) => t.key === selectedType.value)!)

const byRegion = ref<ReportStatsRow[]>([])
const byRegionDate = ref<ReportStatsRow[]>([])
const { loading, error, run, cancel } = useLatestRequest()

const load = async () => {
  if (!scopeReady.value || !regionBreakdown.value || !dateFrom.value || !dateTo.value) {
    cancel()
    byRegion.value = []
    byRegionDate.value = []
    return
  }

  const base = {
    area: areaParam.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    type: [selectedType.value],
    level: regionBreakdown.value.level,
  }
  const interval = pickInterval(dateFrom.value, dateTo.value, 62, 365)
  await run(
    () =>
      Promise.all([
        statsApi.reportsList({ ...base, groupBy: [StatsReportsListGroupByParameter.Region] }),
        statsApi.reportsList({
          ...base,
          groupBy: [StatsReportsListGroupByParameter.Region, StatsReportsListGroupByParameter.Date],
          interval,
          cumulative: true,
        }),
      ]),
    ([a, b]) => {
      byRegion.value = a.data.data as ReportStatsRow[]
      byRegionDate.value = b.data.data as ReportStatsRow[]
    },
  )
}

watch([areaParam, worldMode, dateFrom, dateTo, selectedType], load, { immediate: true })

// * ################# CHARTS #################
// ---------- 1. Horizontal bars by region ----------
const sortedRegions = computed(() => {
  const entries: RankedEntry[] = byRegion.value.map((r) => ({
    name: r.region_name ?? '',
    counts: { count: r.count },
    total: r.count,
  }))
  const list = worldMode.value ? topWithOthers(entries) : entries.sort((a, b) => b.total - a.total)
  return list.reverse()
})

const barHeight = computed(() => `${Math.max(240, sortedRegions.value.length * 28 + 80)}px`)

const barOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    confine: true,
    formatter: (params: any) => {
      const p = Array.isArray(params) ? params[0] : params
      return `${p.axisValueLabel}<br/>${p.marker}${typeInfo.value.label}: <b>${formatNumber(p.value ?? 0)}</b>`
    },
  },
  grid: { left: 8, right: 24, top: 16, bottom: 8, containLabel: true },
  xAxis: { type: 'value', axisLabel: { formatter: (v: number) => formatNumber(v) } },
  yAxis: { type: 'category', data: sortedRegions.value.map((r) => r.name) },
  series: [
    {
      name: typeInfo.value.label,
      type: 'bar',
      itemStyle: { color: typeInfo.value.color },
      data: sortedRegions.value.map((r) => r.total),
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
    const id = r.region_id as number
    let entry = regions.get(id)
    if (!entry) {
      entry = { name: r.region_name as string, data: new Array(dates.value.length).fill(0) }
      regions.set(id, entry)
    }
    entry.data[index.get(r.date!)!] = r.count
  }

  let list = [...regions.values()]
  if (worldMode.value && list.length > TOP_N) {
    list.sort((a, b) => b.data.at(-1)! - a.data.at(-1)!) // by final cumulative value
    const rest = list.slice(TOP_N)
    const others = {
      name: 'Others',
      data: dates.value.map((_, i) => rest.reduce((sum, r) => sum + r.data[i], 0)),
    }
    list = [...list.slice(0, TOP_N), others]
  }

  return (
    list
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
