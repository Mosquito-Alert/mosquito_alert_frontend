<template>
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
</template>
<script setup lang="ts">
import { LGeoJson, LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'
import type { PointTuple } from 'leaflet'
import L from 'leaflet'
import { computed, nextTick, ref, watch } from 'vue'

// * Props
const props = defineProps<{
  selectedRegion: { geometry: any; centroid: { lat: number; lon: number } } | null
}>()

// * Emits
const emit = defineEmits<{
  (e: 'setView', center: PointTuple, zoom: number): void
}>()

// * State
const map = ref<InstanceType<typeof LMap> | null>(null) // The map template ref (Vue component)
const leafletMap = ref<L.Map | null>(null) // Raw Leaflet instance
const mapReady = ref(false)
const defaultMapCenter = [40, -3] as PointTuple // Default center (Madrid, Spain)
const defaultMapZoom = 6 // Default zoom (Spain)
const regionGeojson = computed(() => {
  if (!props.selectedRegion) return null
  return props.selectedRegion.geometry || null
})
const regionCenter = computed<PointTuple>(() => {
  if (!props.selectedRegion) return defaultMapCenter // Default center
  const { lat, lon } = props.selectedRegion.centroid || {}
  return lat && lon ? ([lat, lon] as PointTuple) : defaultMapCenter
})

// * Methods
const onMapReady = (mapInstance: L.Map) => {
  if (!mapInstance) return
  leafletMap.value = mapInstance
  mapReady.value = true
}

const resetView = () => {
  leafletMap.value?.setView(defaultMapCenter, defaultMapZoom)
}

watch(
  [mapReady, regionGeojson],
  async ([ready, geojson]) => {
    if (!ready || !geojson || !leafletMap.value) return

    await nextTick() // Wait for the map to be fully rendered before fitting bounds

    const bounds = L.geoJSON(geojson).getBounds()

    if (bounds.isValid()) {
      leafletMap.value.fitBounds(bounds, {
        padding: [20, 20],
      })
    }
  },
  { immediate: true, flush: 'post' },
)

// * Expose
defineExpose({
  resetView,
})
</script>
