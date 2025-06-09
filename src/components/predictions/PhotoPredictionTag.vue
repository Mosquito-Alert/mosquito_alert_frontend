<template>
  <Tag icon="pi pi-microchip-ai" severity="info" :value="prediction.predicted_class" />
</template>
<script setup lang="ts">
import type { PhotoPrediction } from 'mosquito-alert';

defineProps<{
  prediction: PhotoPrediction;
}>();
</script>
