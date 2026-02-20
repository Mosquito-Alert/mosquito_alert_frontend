<template>
  <l-marker v-if="location" :lat-lng="[location.latitude, location.longitude]" :icon="cameraIcon" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import L from 'leaflet';
import { LMarker } from "@vue-leaflet/vue-leaflet";
import exifr from 'exifr';

import type { SimplePhoto } from 'mosquito-alert';

const cameraIcon = L.icon({
  iconUrl: '/marker_camera_bg_white.png', // relative to public/
  iconSize: [32, 32], // adjust size as needed
  iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -32] // where the popup should open relative to the iconAnchor
});

const props = defineProps<{
  photo: SimplePhoto
}>();

const location = ref<{ latitude: number, longitude: number }>();

watch(() => props.photo.url, async (newUrl) => {
  if (newUrl) {
    const gps = await exifr.gps(newUrl);
    if (
      gps &&
      Number.isFinite(gps.latitude) &&
      Number.isFinite(gps.longitude)
    ) {
      location.value = gps
    } else {
      location.value = undefined
    }
  }
}, { immediate: true });
</script>
