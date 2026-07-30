<template>
  <div class="audience-target flex flex-col w-full items-center gap-3 pt-2">
    <div class="flex flex-wrap gap-2">
      <!-- Search country, city or region -->
      <AutoComplete
        v-model="geometryQuery"
        :suggestions="geometrySuggestions"
        optionLabel="label"
        :loading="isSearchingGeometry"
        @option-select="onGeometrySelect"
        @complete="searchGeometry"
        :delay="350"
        placeholder="Search country, city or region..."
        class="min-w-64 flex-1"
      />
      <!-- Locale filter -->
      <FloatLabel class="w-full md:w-60" variant="on">
        <MultiSelect
          id="locale-select"
          v-model="selectedLocales"
          :options="localeOptions"
          optionLabel="label"
          display="chip"
          filter
          showClear
          :maxSelectedLabels="1"
          class="w-full"
        />
        <label for="locale-select">Filter by locales</label>
      </FloatLabel>
    </div>

    <!-- <div v-if="activeFilters.length" class="flex flex-wrap gap-2">
      <Chip
        v-for="chip in activeFilters"
        :key="chip.key"
        :label="chip.label"
        removable
        @remove="removeFilter(chip)"
      />
    </div> -->

    <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
      <!-- TODO: -->
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { AutoComplete, Select, Chip, MultiSelect, FloatLabel } from 'primevue'

const lastLoginOptions = [
  { label: 'Any time', value: null },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' },
]

const baseNominatimUrl = 'https://nominatim.openstreetmap.org/'

// * Refs */
// GEOMETRY
const geometryQuery = ref('')
// NOTE: https://nominatim.org/release-docs/develop/api/Output/#place_id-is-not-a-persistent-id
const geometrySuggestions = ref<{ label: string; class: string; osmtype: string; osmid: string }[]>(
  [],
) // All the suggestions of the regions returned by Nominatim
const isSearchingGeometry = ref(false) // Loading
const selectedGeometry = ref<any>(null) // The geometry of the region selected // TODO: Make it type Geometry
// LOCALES
const localeOptions = [
  // { label: 'Any locale', value: null },
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'Catalan', value: 'ca' },
  { label: 'Basque', value: 'eu' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Swedish', value: 'sv' },
  { label: 'German', value: 'de' },
  { label: 'Albanian', value: 'sq' },
  { label: 'Greek', value: 'el' },
  { label: 'Galician', value: 'gl' },
  { label: 'Hungarian', value: 'hu' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Slovenian', value: 'sl' },
  { label: 'Italian', value: 'it' },
  { label: 'French', value: 'fr' },
  { label: 'Bulgarian', value: 'bg' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Croatian', value: 'hr' },
  { label: 'Macedonian', value: 'mk' },
  { label: 'Serbian', value: 'sr' },
  { label: 'Letzeburgesch', value: 'lb' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Chinese', value: 'zh-cn' },
]
const selectedLocales = ref<string[]>([]) // The locales selected by the user

// * Methods */
const searchGeometry = async (event: { query: string }) => {
  isSearchingGeometry.value = true

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
    selectedGeometry.value = null // Clear the selected geometry when searching again
    geometrySuggestions.value = data.map((item: any) => ({
      label: item.display_name,
      class: item.class,
      osmtype: item.osm_type.charAt(0).toUpperCase(), // Convert to uppercase (Nominatim returns lowercase, but we want uppercase)
      osmid: item.osm_id,
    }))
  } catch (error) {
    console.error('Error searching geometry:', error)
  } finally {
    isSearchingGeometry.value = false
  }
}

const onGeometrySelect = async (event: {
  value: { class: string; osmtype: string; osmid: string }
}) => {
  isSearchingGeometry.value = true

  const selectedRegion = event.value

  // We want now to fetch the geometry details for the selected item
  const url =
    baseNominatimUrl +
    'details' +
    `?osmtype=${selectedRegion.osmtype}` +
    `&osmid=${selectedRegion.osmid}` +
    `&class=${selectedRegion.class}` +
    `&polygon_geojson=1` +
    `&polygon_threshold=0.005` // Simplify the polygon

  try {
    const response = await fetch(url)
    const data = await response.json()
    selectedGeometry.value = data?.geometry || null
    geometrySuggestions.value = [] // Clear suggestions after selection
  } catch (error) {
    console.error('Error fetching geometry details:', error)
  } finally {
    isSearchingGeometry.value = false
  }
}
</script>
