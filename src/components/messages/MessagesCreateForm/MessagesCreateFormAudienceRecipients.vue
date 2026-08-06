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
        <span v-if="messagesStore.audienceSelected" class="text-sm font-medium italic text-gray-600"
          >Active filters:</span
        >
        <div class="chips flex flex-wrap gap-1.5">
          <Chip
            v-for="chip in activeFiltersAsChips"
            :key="chip.key"
            :label="chip.label"
            :removable="!messagesStore.audienceSelected"
            @remove="removeFilter(chip)"
            :pt="{
              root:
                chip.key === ChipKey.GEOMETRY
                  ? 'bg-indigo-100! '
                  : chip.key === ChipKey.LAST_LOGIN
                    ? 'bg-teal-100! '
                    : chip.key.startsWith(ChipKey.LOCALE_PREFIX)
                      ? 'bg-cyan-100! '
                      : '',
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

    <div v-if="!messagesStore.audienceSelected" class="audience-map w-full h-96 md:h-150">
      <l-map
        :zoom="defaultMapZoom"
        ref="map"
        @ready="onMapReady"
        :center="regionCenter"
        class="rounded-xl"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        />

        <l-geo-json v-if="regionGeojson" :geojson="regionGeojson" />
      </l-map>
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
import { LGeoJson, LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'
import type { PointTuple } from 'leaflet'
import L from 'leaflet'
import { AutoComplete, Chip, FloatLabel, InputGroup, InputGroupAddon, Select } from 'primevue'
import { computed, nextTick, ref, watch } from 'vue'
import { useMessagesStore } from '../../../stores/messagesStore'
import CreateFormLanguageSelector from './MessageCreateFormLanguageSelector.vue'
import { localeOptions } from '../../../utils/constants.ts'
import type { AudienceFilterLocale } from 'mosquito-alert'

const messagesStore = useMessagesStore()

const baseNominatimUrl = 'https://nominatim.openstreetmap.org/'

enum ChipKey {
  GEOMETRY = 'geometry',
  LAST_LOGIN = 'lastLogin',
  LOCALE_PREFIX = 'locale:',
  TAG_PREFIX = 'tag:',
}

// * Refs */
// MAP
const map = ref<InstanceType<typeof LMap> | null>(null) // The map instance
const mapReady = ref(false)

const defaultMapCenter = [40, -3] as PointTuple // Default center (Madrid, Spain)
const defaultMapZoom = 6 // Default zoom (Spain)
const regionGeojson = computed(() => {
  if (!selectedRegion.value) return null
  return selectedRegion.value.geometry || null
})
const regionCenter = computed<PointTuple>(() => {
  if (!selectedRegion.value) return defaultMapCenter // Default center
  const { lat, lon } = selectedRegion.value.centroid || {}
  return lat && lon ? ([lat, lon] as PointTuple) : defaultMapCenter
})
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
      key: ChipKey.GEOMETRY,
      label: selectedRegion.value.localname || 'Selected region',
    })
  }
  // Locales
  if (selectedLocale.value) {
    chips.push({
      key: `${ChipKey.LOCALE_PREFIX}${selectedLocale.value.value}`,
      label: selectedLocale.value.label,
    })
  }
  // Last login
  if (selectedLastLogin.value && selectedLastLogin.value.daysSince !== null) {
    chips.push({ key: ChipKey.LAST_LOGIN, label: selectedLastLogin.value.label })
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

const onMapReady = (mapInstance: InstanceType<typeof LMap>) => {
  if (!mapInstance) return
  map.value = mapInstance
  mapReady.value = true
}

const removeFilter = (chip: { key: string; label: string }) => {
  if (chip.key === ChipKey.GEOMETRY) {
    selectedRegion.value = null
    map.value?.leafletObject?.setView(defaultMapCenter, defaultMapZoom) // Reset to default view
  } else if (chip.key === ChipKey.LAST_LOGIN) selectedLastLogin.value = lastLoginOptions[0]
  else if (chip.key.startsWith(ChipKey.LOCALE_PREFIX)) selectedLocale.value = null

  // TODO:
  // else if (chip.key.startsWith('tag:')) {
  //   const val = chip.key.replace('tag:', '')
  //   selectedHashtags.value = selectedHashtags.value.filter((h) => h !== val)
  // }
  // runFilterQuery()
}

watch(
  [mapReady, regionGeojson],
  async ([ready, geojson]) => {
    if (!ready || !geojson || !map.value?.leafletObject) return

    await nextTick() // Wait for the map to be fully rendered before fitting bounds

    const bounds = L.geoJSON(geojson).getBounds()

    if (bounds.isValid()) {
      map.value.leafletObject.fitBounds(bounds, {
        padding: [20, 20],
      })
    }
  },
  { immediate: true, flush: 'post' },
)

// Watch all the filter
watch(
  [selectedRegion, selectedLocale, selectedLastLogin],
  () => {
    // Update the store with the new audience filter
    messagesStore.setAudience({
      geometry: selectedRegion.value?.geometry || null,
      locale: selectedLocale.value ? selectedLocale.value.value : null,
      daysSinceLastLogin: selectedLastLogin.value?.daysSince || null,
    })
  },
  { deep: true },
)
</script>
