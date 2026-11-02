<template>
  <h4 class="card-title mt-8">Report Statistics: Type Breakdown</h4>

  <!-- * INFORMATION -->
  <div class="my-4">
    <p>
      Overview of the report statistics for the selected area and date range, broken down by report
      type.
    </p>
  </div>

  <Message v-if="error" severity="error" :closable="false">Could not load the statistics.</Message>

  <div v-else class="grid grid-cols-12 gap-4">
    <Card class="col-span-12 lg:col-span-5">
      <template #title>Reports by type</template>
      <template #content>
        <v-chart :option="doughnutOption" :loading="loading" autoresize style="height: 280px" />
      </template>
    </Card>

    <Card class="col-span-12 lg:col-span-7">
      <template #title>Reports by region</template>
      <template #content>
        <small v-if="!regionBreakdown" class="text-color-secondary">
          This area has no subdivisions to compare.
        </small>
        <v-chart
          v-else
          :option="barOption"
          :loading="loading"
          autoresize
          :style="{ height: barHeight }"
        />
      </template>
    </Card>

    <Card class="col-span-12">
      <template #title>Cumulative reports over time</template>
      <template #content>
        <v-chart :option="areaOption" :loading="loading" autoresize style="height: 340px" />
      </template>
    </Card>
  </div>
</template>
<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { StatsReportsListGroupByParameter, type ReportStatsRow } from 'mosquito-alert'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import { useLatestRequest } from '../../../../composables/useLatestRequest'
import { statsApi } from '../../../../services/apiService'
import { useStatisticsStore } from '../../../../stores/statisticsStore'
import {
  STATS_REPORTS_TYPES,
  formatNumber,
  pickInterval,
  stackedTooltip,
  topWithOthers,
  type RankedEntry,
} from '../../../../utils/statsChartsUtils'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
])

const statisticsStore = useStatisticsStore()
const { dateFrom, dateTo, areaParam, scopeReady, regionBreakdown, worldMode, selectedArea } =
  storeToRefs(statisticsStore)

const where = computed(() => (worldMode.value ? 'World' : selectedArea.value?.name || ''))
const totals = ref<ReportStatsRow[]>([])
const regions = ref<ReportStatsRow[]>([])
const series = ref<ReportStatsRow[]>([])
const { loading, error, run } = useLatestRequest()

// Load the report statistics for the selected area and date range.
const load = async () => {
  if (!scopeReady.value || !dateFrom.value || !dateTo.value) return

  const base = { area: areaParam.value, dateFrom: dateFrom.value, dateTo: dateTo.value }
  const interval = pickInterval(dateFrom.value, dateTo.value)
  await run(
    () =>
      Promise.all([
        statsApi.reportsList({ ...base, groupBy: [StatsReportsListGroupByParameter.Type] }),
        regionBreakdown.value
          ? statsApi.reportsList({
              ...base,
              groupBy: [
                StatsReportsListGroupByParameter.Type,
                StatsReportsListGroupByParameter.Region,
              ],
              level: regionBreakdown.value.level,
            })
          : null,
        statsApi.reportsList({
          ...base,
          groupBy: [StatsReportsListGroupByParameter.Type, StatsReportsListGroupByParameter.Date],
          interval,
          cumulative: true,
        }),
      ]),
    ([t, r, s]) => {
      totals.value = t.data.data as ReportStatsRow[]
      regions.value = (r?.data.data as ReportStatsRow[] | undefined) ?? []
      series.value = s.data.data as ReportStatsRow[]
    },
  )
}
// Wait for the area and both dates, so the first load is a single fetch.
watch([areaParam, worldMode, dateFrom, dateTo], load, { immediate: true })

// * ################# CHARTS #################
// ---------- 1. Half doughnut ----------
// We have to create a half doughnut manually by adding an invisible slice for the bottom half, since 'endAngle' has a bug.
const doughnutOption = computed<EChartsOption>(() => {
  const values = STATS_REPORTS_TYPES.map((t) => ({
    name: t.label,
    value: totals.value.find((r) => r.type === t.key)?.count ?? 0,
    itemStyle: { color: t.color },
  }))
  const total = values.reduce((sum, v) => sum + v.value, 0)

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        // p.percent is relative to the full circle (including the hidden half), so compute it against the real total.
        const pct = total ? ((p.value / total) * 100).toFixed(1) : '0.0'
        return `${p.marker}${p.name}: <b>${formatNumber(p.value)}</b> (${pct}%)`
      },
    },
    // Explicit list, so the hidden slice doesn't show up in the legend.
    legend: { bottom: 0, data: STATS_REPORTS_TYPES.map((t) => t.label) },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '70%'],
        startAngle: 180, // no endAngle
        label: {
          show: true,
          position: 'outside',
          formatter: (p: any) => formatNumber(p.value),
        },
        emphasis: {
          scale: true,
          label: { show: true, formatter: (p: any) => formatNumber(p.value) },
        },
        data: [
          ...values,
          // Invisible slice covering the bottom half.
          {
            name: '',
            value: total,
            itemStyle: { color: 'transparent' },
            label: { show: false },
            labelLine: { show: false },
            emphasis: { disabled: true },
            tooltip: { show: false },
          },
        ],
      },
    ],
  }
})

// ---------- 2. Stacked horizontal bars by region ----------
// const regionNames = computed(() => {
//   const sums = new Map<string, number>()
//   for (const r of regions.value) {
//     sums.set(r.region_name!, (sums.get(r.region_name!) ?? 0) + r.count)
//   }
//   // ascending: ECharts draws the first category at the bottom
//   return [...sums.entries()].sort((a, b) => a[1] - b[1]).map(([name]) => name)
// })

// One entry per region/country, with counts per type. Top 10 + Others in world mode.
const regionRows = computed(() => {
  const byName = new Map<string, RankedEntry>()
  for (const r of regions.value) {
    const name = r.region_name ?? ''
    const e = byName.get(name) ?? { name, counts: {}, total: 0 }
    e.counts[r.type!] = r.count
    e.total += r.count
    byName.set(name, e)
  }
  const entries = [...byName.values()]
  const list = worldMode.value ? topWithOthers(entries) : entries.sort((a, b) => b.total - a.total)
  // ECharts draws the first category at the bottom: the biggest ends up on top.
  return list.reverse()
})

const barHeight = computed(() => `${Math.max(240, regionRows.value.length * 28 + 80)}px`)

const barOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', formatter: stackedTooltip },
  legend: { top: 0 },
  grid: { left: 8, right: 24, top: 40, bottom: 8, containLabel: true },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: regionRows.value.map((r) => r.name) },
  series: STATS_REPORTS_TYPES.map((t) => ({
    name: t.label,
    type: 'bar',
    stack: 'total',
    itemStyle: { color: t.color },
    data: regionRows.value.map((r) => r.counts[t.key] ?? 0),
  })),
}))

// ---------- 3. Cumulative stacked area ----------
const dates = computed(() => [...new Set(series.value.map((r) => r.date!))].sort())

const areaOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', formatter: stackedTooltip },
  legend: { top: 0 },
  grid: { left: 8, right: 24, top: 40, bottom: 8, containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: dates.value },
  yAxis: { type: 'value' },
  series: STATS_REPORTS_TYPES.map((t) => {
    const byDate = new Map(
      series.value.filter((r) => r.type === t.key).map((r) => [r.date!, r.count]),
    )
    return {
      name: t.label,
      type: 'line',
      stack: 'total',
      areaStyle: { opacity: 0.6 },
      showSymbol: false,
      itemStyle: { color: t.color },
      data: dates.value.map((d) => byDate.get(d) ?? 0),
    }
  }),
}))
</script>
