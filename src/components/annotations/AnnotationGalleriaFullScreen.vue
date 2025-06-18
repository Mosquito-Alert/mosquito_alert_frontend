<template>
  <Galleria v-model:visible="isVisible" :value="photos" containerStyle="height: 90%" circular fullScreen
    showItemNavigators :showThumbnails="false" :showIndicators="true" :changeItemOnIndicatorHover="true"
    showIndicatorsOnItem :pt="{
      content: 'h-full',
      itemsContainer: 'h-full items-center justify-center',
      caption: 'flex top-2! right-2! left-auto! bottom-auto! bg-transparent!',
    }">
    <template #item="slotProps">
      <img :src="slotProps.item.url" class="max-h-full object-contain" />
    </template>
    <template #caption="slotProps">
      <BestPhotoTag v-if="slotProps.item.uuid === bestPhoto?.uuid" class="ml-auto" />
    </template>
  </Galleria>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { SimplePhoto } from 'mosquito-alert';

import BestPhotoTag from '../photos/BestPhotoTag.vue';

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const props = withDefaults(defineProps<{
  photos: Array<SimplePhoto>,
  bestPhoto?: SimplePhoto,
  visible?: boolean
}>(), {
  visible: false
});

const isVisible = ref(props.visible);

watch(() => props.visible, (newVal) => {
  isVisible.value = newVal;
});

watch(isVisible, (newVal) => {
  emit('update:visible', newVal);
});

</script>
