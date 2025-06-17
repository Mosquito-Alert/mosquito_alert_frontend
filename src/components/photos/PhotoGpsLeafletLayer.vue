<template>
  <l-feature-group name="Photo locations" layer-type="overlay" :visible="false">
    <PhotoGpsLeafletFeature v-for="(photo, index) in photos" :photo="photo" :key="index" />
  </l-feature-group>
</template>

<script setup lang="ts">
import { LFeatureGroup } from "@vue-leaflet/vue-leaflet";
import type { SimplePhoto } from 'mosquito-alert';
import PhotoGpsLeafletFeature from './PhotoGpsLeafletFeature.vue';

defineProps<{
  photos: SimplePhoto[]
}>();

</script>
