// * Constants and utility functions for statistics charts

import {
  AreaMetaLevel,
  StatsReportsListIntervalParameter,
  StatsReportsListLevelParameter,
  type StatsArea,
} from 'mosquito-alert'

// Statistics report types for charts
export const STATS_REPORTS_TYPES = [
  { key: 'adult', label: 'Adults', color: '#fbc800' },
  { key: 'bite', label: 'Bites', color: '#f44336' },
  { key: 'site', label: 'Breeding sites', color: '#2196f3' },
] as const

export type TypeKey = (typeof STATS_REPORTS_TYPES)[number]['key']

// Format numbers with commas for thousands
export const formatNumber = (n: number) => n.toLocaleString('en-US')

// Get the region level below the current area level. `level` must be strictly finer than the area's level; NUTS3 has nothing below.
export const getSubRegionLevel = (
  area: StatsArea | null,
): StatsReportsListLevelParameter | null => {
  if (!area) return null
  const level = area.level
  return level === AreaMetaLevel.Country ? 2 : level === AreaMetaLevel.Nuts2 ? 3 : null
}

// Keep the timeseries under the backend's row cap.
export const pickInterval = (
  from: string,
  to: string,
  capForDays: number = 62,
  capForWeeks: number = 365,
) => {
  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000
  return days <= capForDays
    ? StatsReportsListIntervalParameter.Day
    : days <= capForWeeks
      ? StatsReportsListIntervalParameter.Week
      : StatsReportsListIntervalParameter.Month
}

// Tooltip for stacked charts: one line per series plus the total.
export const stackedTooltip = (params: unknown): string => {
  const items = params as {
    axisValueLabel: string
    marker: string
    seriesName: string
    value: number
  }[]
  if (!items.length) return ''

  const total = items.reduce((sum, i) => sum + (i.value ?? 0), 0)
  const lines = items
    .map(
      (i) =>
        `<div style="display:flex;justify-content:space-between;gap:16px">
           <span>${i.marker}${i.seriesName}</span><b>${formatNumber(i.value)}</b>
         </div>`,
    )
    .join('')

  return `
    <div style="margin-bottom:4px">${items[0].axisValueLabel}</div>
    ${lines}
    <div style="display:flex;justify-content:space-between;gap:16px;margin-top:4px;
                padding-top:4px;border-top:1px solid #ccc">
      <span>Total</span><b>${formatNumber(total)}</b>
    </div>`
}

// Number of top items to display in charts
export const TOP_N = 15

export interface RankedEntry {
  name: string
  counts: Record<string, number> // per type, e.g. { adult: 3, bite: 1 }
  total: number
}

// Largest first; everything beyond `n` is summed into one "Others" entry (last).
export function topWithOthers(entries: RankedEntry[], n = TOP_N, label = 'Others'): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => b.total - a.total)
  if (sorted.length <= n) return sorted
  const counts: Record<string, number> = {}
  let total = 0
  for (const e of sorted.slice(n)) {
    total += e.total
    for (const [k, v] of Object.entries(e.counts)) counts[k] = (counts[k] ?? 0) + v
  }
  return [...sorted.slice(0, n), { name: label, counts, total }]
}
