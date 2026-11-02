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
    <!-- INDEX -->
    <nav class="mt-4 p-4 rounded-border border border-surface" aria-label="Index">
      <div class="flex items-center justify-between mb-3">
        <h3 class="italic">Index</h3>
        <div class="flex gap-2">
          <Button label="Expand all" size="small" text @click="setAll(false)" />
          <Button label="Collapse all" size="small" text @click="setAll(true)" />
        </div>
      </div>

      <ul class="list-none m-0 p-0 flex flex-col gap-3">
        <li v-for="s in sections" :key="s.id">
          <a
            :href="`#${s.id}`"
            class="flex items-center gap-2 font-semibold no-underline text-color hover:text-primary"
            @click.prevent="goTo(s.id, s.id)"
          >
            <i :class="s.icon" /> {{ s.label }}
          </a>

          <ul
            v-if="s.children.length > 1"
            class="list-none m-0 mt-2 ml-8 pl-3 p-0 flex flex-col gap-1.5 border-l border-surface"
          >
            <li v-for="c in s.children" :key="c.id">
              <a
                :href="`#${c.id}`"
                class="text-sm no-underline text-color-secondary hover:text-primary"
                @click.prevent="goTo(s.id, c.id)"
              >
                {{ c.label }}
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- SECTIONS -->
    <div class="mt-4 flex flex-col gap-6">
      <div v-for="s in sections" :id="s.id" :key="s.id" class="scroll-mt-32">
        <Panel
          :header="s.label"
          toggleable
          :collapsed="collapsed[s.id] ?? false"
          @update:collapsed="collapsed[s.id] = $event"
        >
          <template v-for="(c, i) in s.children" :key="c.id">
            <div :id="c.id" class="scroll-mt-32">
              <component :is="c.component" />
            </div>
            <Divider v-if="i < s.children.length - 1" class="my-8" />
          </template>
        </Panel>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Divider from 'primevue/divider'
import Panel from 'primevue/panel'
import { nextTick, reactive, type Component } from 'vue'
import AreaSelector from '@/components/statistics/AreaSelector.vue'
import DateRangePickerWithPresets from '@/components/statistics/DateRangePickerWithPresets.vue'
import DownloadStatistics from '../../components/statistics/participation/users/DownloadStatistics.vue'
import TypeBreakdownReportStatistics from '../../components/statistics/participation/reports/TypeBreakdownReportStatistics.vue'
import ByTypeReportStatistics from '../../components/statistics/participation/reports/ByTypeReportStatistics.vue'

interface Subsection {
  id: string
  label: string
  component: Component
}
interface Section {
  id: string
  label: string
  icon: string
  children: Subsection[]
}

const sections: Section[] = [
  {
    id: 'reports',
    label: 'Reports',
    icon: 'pi pi-file',
    children: [
      {
        id: 'reports-type-breakdown',
        label: 'Type breakdown',
        component: TypeBreakdownReportStatistics,
      },
      {
        id: 'reports-by-type',
        label: 'Filtered by report type',
        component: ByTypeReportStatistics,
      },
    ],
  },
  // TODO: Sampling effort
  {
    id: 'downloads',
    label: 'User downloads',
    icon: 'pi pi-download',
    children: [{ id: 'downloads-main', label: 'Downloads', component: DownloadStatistics }],
  },
  // TODO: User profiling
]

// section id -> collapsed?
const collapsed = reactive<Record<string, boolean>>({})

const setAll = (value: boolean) => sections.forEach((s) => (collapsed[s.id] = value))

// Expand the parent first, wait for the DOM, then scroll.
async function goTo(sectionId: string, targetId: string) {
  collapsed[sectionId] = false
  await nextTick()
  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', `#${targetId}`)
}
</script>
