<template>
  <div class="flex h-full w-full items-center rounded-xl">
    <Galleria :activeIndex="activePhotoIndex" :value="assignment.observation.photos" :numVisible="5"
      thumbnailsPosition="right" :containerClass="{
        'w-full': true,
        'h-full': true,
        'flex': true,
        'border-0!': true,
        'rounded-r-none!': isStarted
      }" circular :showThumbnails="!isStarted" :showThumbnailNavigators="!isStarted" :showItemNavigators="!isStarted"
      :showItemNavigatorsOnHover="!isStarted" :pt="{
        content: 'w-full bg-black/80!',
        itemsContainer: 'w-full h-full',
        items: 'w-full',
        thumbnails: 'w-1/12',
        thumbnailContent: 'border-l border-white/20 bg-black/80!',
        thumbnailsViewport: 'h-full!',
        caption: 'flex top-4! right-2! left-auto! bottom-auto! bg-transparent!',
        // thumbnailItems: 'h-full',
        // thumbnail: 'h-full'
      }">
      <template #item="slotProps">
        <ProgressSpinner class="self-center" v-if="loading" />
        <Image v-if="!loading" :src="slotProps.item.url" imageClass="h-full object-contain" preview :pt="{
          root: 'h-full'
        }" />
      </template>
      <template #thumbnail="slotProps">
        <img v-if="!loading" :src="slotProps.item.url" class="h-full object-contain" />
      </template>
      <template #caption>
        <Button v-if="!isStarted" class="ml-auto" label="Annotate this picture" icon="pi pi-arrow-right" iconPos="right"
          @click="startAnnotation" :loading="loading" />
        <BestPhotoTag v-if="isStarted" class="ml-auto" />
      </template>
    </Galleria>
    <div class="flex flex-col w-200 h-full bg-white p-4 z-10 transition-all duration-500 ease-in-out"
      :class="{ 'w-0! p-0!': !isStarted }">
      <div v-if="isStarted" class="flex flex-col h-full">
        <div class="flex flex-row gap-2 items-center mb-4 ">
          <h4 class="m-0!">New annotation</h4>
          <AnnotationExtendedTag v-if="isExtended" class="h-min" />
          <div class="flex flex-row ml-auto">
            <Button :icon="isFlagged ? 'pi pi-flag-fill' : 'pi pi-flag'" severity="danger" variant="text" rounded
              aria-label="Mark as flagged" @click="isFlagged = !isFlagged" />
            <Button icon="pi pi-times" severity="secondary" variant="text" rounded aria-label="Cancel"
              @click="cancelAnnotation" />

          </div>
        </div>
        <AnnotationForm v-if="activePhoto" :observation="assignment.observation" :best-photo="activePhoto"
          :annotation-type="assignment.annotation_type" :isFlagged="isFlagged" @submit="onSubmitAnnotation" />
      </div>
    </div>
  </div>

</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { AssignmentAnnotationType, type Assignment } from 'mosquito-alert';

import AnnotationForm from './AnnotationForm.vue';
import AnnotationExtendedTag from './AnnotationExtendedTag.vue';
import BestPhotoTag from '../photos/BestPhotoTag.vue';

const isStarted = ref(false);
const isFlagged = ref(false);
const activePhotoIndex = ref(0);

const activePhoto = computed(() => {
  return props.assignment.observation.photos[activePhotoIndex.value];
});

const isExtended = computed(() => {
  return props.assignment.annotation_type === AssignmentAnnotationType.Long;
});

const props = withDefaults(defineProps<{
  assignment: Assignment,
  loading?: boolean
}>(), {
  loading: false
});

watch(() => props.assignment, (newAssignment) => {
  if (newAssignment) {
    activePhotoIndex.value = 0; // Reset to the first photo when assignment changes
    isStarted.value = false; // Reset annotation state
    isFlagged.value = false; // Reset flagged state
  }
}, { immediate: true });

const emit = defineEmits<{
  (e: 'onStartAnnotation'): void,
  (e: 'onCancelAnnotation'): void
  (e: 'onSubmitAnnotation', shouldContinue: boolean): void
}>()

const startAnnotation = () => {
  emit('onStartAnnotation')
  isStarted.value = true
}

const cancelAnnotation = () => {
  emit('onCancelAnnotation')
  isStarted.value = false
}

const onSubmitAnnotation = (shouldContinue: boolean) => {
  emit('onSubmitAnnotation', shouldContinue)
  if (!shouldContinue) {
    isStarted.value = false
  }
}

</script>
