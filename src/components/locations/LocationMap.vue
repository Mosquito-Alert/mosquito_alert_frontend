<template>
  <div :style="{ height: height }">
    <l-map :zoom="13" :options="{ zoomControl: false }" class="rounded-xl" :center="latlon">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OpenStreetMap" />
      <l-marker :lat-lng="latlon" />
      <slot></slot>
    </l-map>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";

// Fix default marker icon
import L, { type PointTuple } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import type { Location, SimplifiedLocation } from 'mosquito-alert';


defineExpose({ LMap, LTileLayer, LMarker });

const props = defineProps<{
  height: string,
  location: Location | SimplifiedLocation
}>();

const latlon = ref<PointTuple>([props.location.point.latitude, props.location.point.longitude]);

</script>
