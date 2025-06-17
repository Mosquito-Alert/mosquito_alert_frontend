<template>
  <div v-if="showBox" class="absolute" :style="{
    top: prediction.bbox.y_min * 100 + '%',
    left: prediction.bbox.x_min * 100 + '%',
    width: (prediction.bbox.x_max - prediction.bbox.x_min) * 100 + '%',
    height: (prediction.bbox.y_max - prediction.bbox.y_min) * 100 + '%',
  }">
    <!-- Border -->
    <div class="size-full border-2 border-2 border-(--p-tag-info-background)">
      <!-- Tag positioned above -->
      <div class="absolute -top-5 left-0">
        <Tag v-if="showLabel" icon="pi pi-microchip-ai" severity="info" :value="prediction.taxon?.name"
          class="pb-0! rounded-b-none!" />
      </div>
    </div>
  </div>
  <div v-else class="absolute top-2 left-2">
    <Tag v-if="showLabel" icon="pi pi-microchip-ai" severity="info" :value="prediction.taxon?.name || 'Unclassified'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PhotoPrediction } from 'mosquito-alert';

const showBox = computed<boolean>(() => {
  return props.prediction.bbox.x_max !== 0 && props.prediction.bbox.y_max !== 0
})

const props = withDefaults(defineProps<{
  prediction: PhotoPrediction,
  showLabel?: boolean,
}>(), {
  showLabel: true
});

</script>
