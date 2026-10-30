<template>
  <h4 class="card-title my-8">Global Report Statistics</h4>

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
        <small v-if="!regionLevel" class="text-color-secondary">
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
  getSubRegionLevel,
  pickInterval,
  stackedTooltip,
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
const { selectedArea, dateFrom, dateTo } = storeToRefs(statisticsStore)

const totals = ref<ReportStatsRow[]>([])
const regions = ref<ReportStatsRow[]>([])
const series = ref<ReportStatsRow[]>([])
const { loading, error, run } = useLatestRequest()

// `level` must be strictly finer than the area's level; NUTS3 has nothing below.
const regionLevel = computed(() => getSubRegionLevel(selectedArea.value))

// Load the report statistics for the selected area and date range.
const load = async () => {
  const area = selectedArea.value
  if (!area || !dateFrom.value || !dateTo.value) return

  const base = { area: area.key, dateFrom: dateFrom.value, dateTo: dateTo.value }
  const interval = pickInterval(dateFrom.value, dateTo.value)
  await run(
    () =>
      Promise.all([
        statsApi.reportsList({ ...base, groupBy: [StatsReportsListGroupByParameter.Type] }),
        regionLevel.value
          ? statsApi.reportsList({
              ...base,
              groupBy: [
                StatsReportsListGroupByParameter.Type,
                StatsReportsListGroupByParameter.Region,
              ],
              level: regionLevel.value,
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
watch([selectedArea, dateFrom, dateTo], load, { immediate: true })

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
const regionNames = computed(() => {
  const sums = new Map<string, number>()
  for (const r of regions.value) {
    sums.set(r.region_name!, (sums.get(r.region_name!) ?? 0) + r.count)
  }
  // ascending: ECharts draws the first category at the bottom
  return [...sums.entries()].sort((a, b) => a[1] - b[1]).map(([name]) => name)
})

const barHeight = computed(() => `${Math.max(240, regionNames.value.length * 28 + 80)}px`)

const barOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: stackedTooltip },
  legend: { top: 0 },
  grid: { left: 8, right: 24, top: 40, bottom: 8, containLabel: true },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: regionNames.value },
  series: STATS_REPORTS_TYPES.map((t) => ({
    name: t.label,
    type: 'bar',
    stack: 'total',
    itemStyle: { color: t.color },
    data: regionNames.value.map(
      (name) => regions.value.find((r) => r.region_name === name && r.type === t.key)?.count ?? 0,
    ),
  })),
}))

// ---------- 3. Cumulative stacked area ----------
const dates = computed(() => [...new Set(series.value.map((r) => r.date!))].sort())

const areaOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: stackedTooltip },
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
