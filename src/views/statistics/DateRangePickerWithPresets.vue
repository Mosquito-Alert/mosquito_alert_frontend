<template>
  <DatePicker
    class="min-w-[240px]"
    :model-value="pickerValue"
    selection-mode="range"
    :min-date="MIN_DATE"
    :max-date="today"
    :manual-input="false"
    :pt="{ panel: { class: 'flex flex-row' } }"
    @update:model-value="onUpdate"
  >
    <template #header>
      <div class="flex flex-col gap-1 p-2 pr-3 border-r border-surface min-w-[8rem]">
        <Button
          v-for="preset in presets"
          :key="preset.key"
          :label="preset.label"
          size="small"
          :severity="activePreset === preset.key ? 'primary' : 'secondary'"
          :text="activePreset !== preset.key"
          class="justify-start"
          @click="commit(...preset.range())"
        />
      </div>
    </template>
  </DatePicker>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { DatePicker } from 'primevue'
import { useStatisticsStore } from '@/stores/statisticsStore'

const store = useStatisticsStore()
const { dateFrom, dateTo } = storeToRefs(store)

const MIN_DATE = new Date(2014, 5, 13)
const today = ref(new Date())

// Local YYYY-MM-DD (toISOString() would shift the day for non-UTC users).
const format = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// * ---- Presets ----
type Preset = { key: string; label: string; range: () => [Date, Date] }
const presets: Preset[] = [
  {
    key: 'last_week',
    label: 'Last week',
    range: () => {
      const to = today.value
      return [new Date(to.getFullYear(), to.getMonth(), to.getDate() - 7), to]
    },
  },
  {
    key: 'last_month',
    label: 'Last month',
    range: () => {
      const to = today.value
      return [new Date(to.getFullYear(), to.getMonth() - 1, to.getDate()), to]
    },
  },
  {
    key: 'last_year',
    label: 'Last year',
    range: () => {
      const to = today.value
      return [new Date(to.getFullYear() - 1, to.getMonth(), to.getDate()), to]
    },
  },
  { key: 'all', label: 'All', range: () => [MIN_DATE, today.value] },
]

// * ---- Picker state ----
// Local copy: while picking a range the picker emits [start, null] after the
// first click. That partial value stays here; only complete ranges reach the store.
const pickerValue = ref<(Date | null)[]>([])

// Store -> picker (initial load, reset, or external changes).
const syncFromStore = () => {
  pickerValue.value =
    dateFrom.value && dateTo.value
      ? [parse(dateFrom.value), parse(dateTo.value)]
      : [MIN_DATE, today.value]
}

const commit = (from: Date, to: Date) => {
  const [a, b] = from <= to ? [from, to] : [to, from]
  store.setDateRange(format(a), format(b))
  pickerValue.value = [a, b]
}

const onUpdate = (value: unknown) => {
  pickerValue.value = Array.isArray(value) ? value : []
  const [from, to] = pickerValue.value
  if (from && to) commit(from, to)
}

const activePreset = computed(() => {
  if (!dateFrom.value || !dateTo.value) return null
  return (
    presets.find((p) => {
      const [from, to] = p.range()
      return format(from) === dateFrom.value && format(to) === dateTo.value
    })?.key ?? null
  )
})

onMounted(() => {
  // Default to "All" the first time, without overwriting an existing selection.
  if (!dateFrom.value || !dateTo.value) commit(...presets.find((p) => p.key === 'all')!.range())
  else syncFromStore()
})
</script>
