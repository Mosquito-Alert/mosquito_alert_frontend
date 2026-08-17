<template>
  <div class="audience-target flex flex-col w-full items-start gap-3 pt-2">
    <div v-if="!messagesStore.audienceSelected" class="select-filters flex flex-wrap gap-2">
      <!-- Search country, city or region -->
      <InputGroup
        :pt="{
          root: 'w-full! md:w-75!',
        }"
      >
        <InputGroupAddon> <i class="pi pi-map-marker"></i> </InputGroupAddon>
        <AutoComplete
          v-model="regionQuery"
          :suggestions="regionSuggestions"
          optionLabel="label"
          :loading="isSearchingRegion"
          @option-select="onRegionSelect"
          @complete="searchRegion"
          :delay="350"
          placeholder="Search country, city or region..."
          :pt="{
            root: 'w-full',
          }"
        />
      </InputGroup>
      <!-- Locale filter -->
      <InputGroup
        :pt="{
          root: 'w-full! md:w-70!',
        }"
      >
        <InputGroupAddon> <i class="pi pi-globe"></i> </InputGroupAddon>
        <FloatLabel class="w-full" variant="on">
          <Select
            id="locale-select"
            v-model="selectedLocale"
            :options="localeOptions"
            optionLabel="label"
            filter
            showClear
            class="w-full"
          />
          <label for="locale-select">Filter by locale</label>
        </FloatLabel>
      </InputGroup>
      <!-- Last Login filter -->
      <InputGroup
        :pt="{
          root: 'w-full! md:w-70!',
        }"
      >
        <InputGroupAddon> <i class="pi pi-history"></i> </InputGroupAddon>
        <FloatLabel class="w-full" variant="on">
          <Select
            id="last-login-select"
            v-model="selectedLastLogin"
            :options="lastLoginOptions"
            showClear
            optionLabel="label"
            class="w-full md:w-60"
          />
          <label for="last-login-select">Filter by last login</label>
        </FloatLabel>
      </InputGroup>
      <!-- TODO: Hashtags filter -->
    </div>

    <div class="flex flex-row w-full items-center gap-2">
      <div
        v-if="activeFiltersAsChips.length"
        class="active-filters flex flex-col gap-1 w-full"
        :class="{
          'bg-gray-100 py-1 px-3 rounded-lg': messagesStore.audienceSelected,
        }"
      >
        <div
          v-if="messagesStore.audienceSelected"
          class="text-sm font-medium italic text-gray-600 flex justify-between"
        >
          <span>
            {{ activeFiltersAsChips.length }} active filter{{
              activeFiltersAsChips.length > 1 ? 's' : ''
            }}:
          </span>
          <span>({{ `${messagesStore.usersAffectedByAudience}` }} users match)</span>
        </div>
        <div class="chips flex flex-wrap gap-1.5">
          <Chip
            v-for="chip in activeFiltersAsChips"
            :key="chip.key"
            :label="chip.label"
            :removable="!messagesStore.audienceSelected"
            @remove="removeFilter(chip)"
            :pt="{
              root: getChipMessageStyle(chip.key),
            }"
          />
        </div>
      </div>
      <!-- Language selector -->
      <CreateFormLanguageSelector
        v-if="
          messagesStore.showMessageCreationDetails && messagesStore.availableLanguages.length > 0
        "
        class="ml-auto"
      />
    </div>

    <div
      v-if="!messagesStore.audienceSelected"
      class="audience-map w-full h-96 md:h-150 relative flex items-center justify-center rounded-xl border border-surface-200 bg-surface-50"
    >
      <MessageMapFilter ref="messageMapFilter" :selectedRegion="selectedRegion" />
      <div
        class="absolute bottom-2 left-2 flex items-center gap-2 rounded-md border border-surface-200 bg-surface-0 px-3 py-1.5 text-sm text-surface-600 z-400"
      >
        <i class="pi pi-filter text-xs" />
        <span
          >{{ activeFiltersAsChips.length }} filters
          <span v-if="messagesStore.usersAffectedByAudience" class="ml-1">
            —
            <span class="font-bold text-surface-800">{{
              ` ${messagesStore.usersAffectedByAudience} `
            }}</span>
            users match
          </span>
        </span>
      </div>
    </div>

    <Button
      v-if="!messagesStore.audienceSelected && activeFiltersAsChips.length > 0"
      label="Select Audience"
      variant="outlined"
      @click="messagesStore.audienceSelected = true"
      class="justify-end"
    />
  </div>
</template>
<script setup lang="ts">
import { AutoComplete, Chip, FloatLabel, InputGroup, InputGroupAddon, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

import type { AudienceFilterLocale } from 'mosquito-alert'
import { useMessagesStore } from '../../../stores/messagesStore'
import { ChipMessageKey } from '../../../types/types.ts'
import { getChipMessageStyle, localeOptions } from '../../../utils/constants.ts'
import MessageMapFilter from '../MessageMapFilter.vue'
import CreateFormLanguageSelector from './MessagesCreateFormLanguageSelector.vue'

const messagesStore = useMessagesStore()

const baseNominatimUrl = 'https://nominatim.openstreetmap.org/'

// * Refs */
const messageMapFilter = ref<InstanceType<typeof MessageMapFilter> | null>(null)
// GEOMETRY
const regionQuery = ref('')
// NOTE: https://nominatim.org/release-docs/develop/api/Output/#place_id-is-not-a-persistent-id
const regionSuggestions = ref<{ label: string; class: string; osmtype: string; osmid: string }[]>(
  [],
) // All the suggestions of the regions returned by Nominatim
const isSearchingRegion = ref(false) // Loading
const selectedRegion = ref<any>(null) // The geometry of the region selected // TODO: Make it type Geometry
// LOCALES
const selectedLocale = ref<{ label: string; value: AudienceFilterLocale } | null>(null) // The locale selected by the user
// LAST LOGIN
const lastLoginOptions = [
  { label: 'Last 7 days', daysSince: 7 },
  { label: 'Last 30 days', daysSince: 30 },
  { label: 'Last 90 days', daysSince: 90 },
  { label: 'Last year', daysSince: 365 },
]
const selectedLastLogin = ref<{ label: string; daysSince: number | null } | null>(null) // The last login filter selected by the user

// Active filters as removable chips
const activeFiltersAsChips = computed(() => {
  const chips: { key: string; label: string }[] = []
  // Geometry
  if (selectedRegion.value) {
    chips.push({
      key: ChipMessageKey.GEOMETRY,
      label: selectedRegion.value.localname || 'Selected region',
    })
  }
  // Locales
  if (selectedLocale.value) {
    chips.push({
      key: `${ChipMessageKey.LOCALE_PREFIX}${selectedLocale.value.value}`,
      label: selectedLocale.value.label,
    })
  }
  // Last login
  if (selectedLastLogin.value && selectedLastLogin.value.daysSince !== null) {
    chips.push({ key: ChipMessageKey.LAST_LOGIN, label: selectedLastLogin.value.label })
  }
  // TODO: selectedHashtags.value.forEach((h) => chips.push({ key: `tag:${h}`, label: `#${h}` }))
  return chips
})

// * Methods */
const searchRegion = async (event: { query: string }) => {
  isSearchingRegion.value = true

  // Minimun data response (we want only the names)
  const url =
    baseNominatimUrl +
    'search' +
    `?q=${encodeURIComponent(event.query)}` +
    `&format=json` +
    `&limit=5`
  try {
    const response = await fetch(url)
    const data = await response.json()
    selectedRegion.value = null // Clear the selected geometry when searching again
    regionSuggestions.value = data.map((item: any) => ({
      label: item.display_name,
      class: item.class,
      osmtype: item.osm_type.charAt(0).toUpperCase(), // Convert to uppercase (Nominatim returns lowercase, but we want uppercase)
      osmid: item.osm_id,
    }))
  } catch (error) {
    console.error('Error searching geometry:', error)
  } finally {
    isSearchingRegion.value = false
  }
}

const onRegionSelect = async (event: {
  value: { class: string; osmtype: string; osmid: string }
}) => {
  isSearchingRegion.value = true

  const selectedSuggestion = event.value

  // We want now to fetch the geometry details for the selected item
  const url =
    baseNominatimUrl +
    'details' +
    `?osmtype=${selectedSuggestion.osmtype}` +
    `&osmid=${selectedSuggestion.osmid}` +
    `&class=${selectedSuggestion.class}` +
    `&polygon_geojson=1` +
    `&polygon_threshold=0.005` // Simplify the polygon

  try {
    const response = await fetch(url)
    const data = await response.json()
    selectedRegion.value = data || null
    regionSuggestions.value = [] // Clear suggestions after selection
  } catch (error) {
    console.error('Error fetching geometry details:', error)
  } finally {
    isSearchingRegion.value = false
  }
}

const removeFilter = (chip: { key: string; label: string }) => {
  if (chip.key === ChipMessageKey.GEOMETRY) {
    selectedRegion.value = null
    messageMapFilter.value?.resetView() // Reset to default view (Madrid, Spain)
  } else if (chip.key === ChipMessageKey.LAST_LOGIN) selectedLastLogin.value = lastLoginOptions[0]
  else if (chip.key.startsWith(ChipMessageKey.LOCALE_PREFIX)) selectedLocale.value = null

  // TODO:
  // else if (chip.key.startsWith('tag:')) {
  //   const val = chip.key.replace('tag:', '')
  //   selectedHashtags.value = selectedHashtags.value.filter((h) => h !== val)
  // }
}

// Watch all the filter
watch(
  [selectedRegion, selectedLocale, selectedLastLogin],
  async () => {
    // Update the store with the new audience filter
    messagesStore.setAudience({
      geometry: selectedRegion.value?.geometry || null,
      locale: selectedLocale.value ? selectedLocale.value.value : null,
      daysSinceLastLogin: selectedLastLogin.value?.daysSince || null,
    })
    // Update the number of affected users by the filters applied
    await messagesStore.fetchUsersByAudience()
  },
  { deep: true },
)
</script>
