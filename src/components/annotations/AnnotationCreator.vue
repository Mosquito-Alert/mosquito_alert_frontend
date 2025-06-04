<template>
  <div v-bind="$attrs">
    <div class="flex size-full rounded-xl! bg-white">
      <Galleria :activeIndex="activePhotoIndex" :value="assignment.observation.photos" :numVisible="5"
        thumbnailsPosition="right" :containerClass="{
          'w-full': true,
          'h-full': true,
          'border-0!': true,
          'rounded-r-none!': isStarted
        }" circular :showThumbnails="!isStarted" :showThumbnailNavigators="!isStarted" :showItemNavigators="!isStarted"
        :showItemNavigatorsOnHover="!isStarted" :pt="{
          content: 'bg-black/80! h-full',
          itemsContainer: 'h-full w-full items-center justify-center',
          items: 'flex-1 w-full items-center justify-center',
          thumbnails: 'w-1/12',
          // thumbnailContent: 'border-l border-white/20 bg-black/80! h-full! max-h-full!',
          thumbnailsViewport: 'flex-1',
          caption: 'top-0! left-0! right-auto! bottom-auto! bg-transparent! p-0!',
        }">
        <template #item="slotProps">
          <ProgressSpinner class="self-center" v-if="loading" />
          <!-- <Image v-if="!loading" :src="slotProps.item.url" imageClass="max-h-full object-contain" :pt="{
            root: 'h-full flex items-center justify-center',
          }" /> -->
          <Magnifier v-if="!loading" :src="slotProps.item.url" class="h-full" :zoom-scale="5" :size="250" />
          <!-- <img v-if="!loading" :src="slotProps.item.url" class="max-h-full object-contain" /> -->
        </template>
        <template #thumbnail="slotProps">
          <img v-if="!loading" :src="slotProps.item.url" class="max-h-full aspect-square object-scale-down" />
        </template>
        <template #caption>
          <div class="flex">
            <div
              class="flex flex-row h-min items-center p-2 gap-2 bg-linear-to-r from-(--p-galleria-caption-background) from-80% to-transparent">
              <div class="font-medium text-md text-gray-300">
                <span>Observation uuid: </span>
                <span class="text-gray-200">{{ assignment.observation.uuid }}</span>
              </div>
              <Button icon="pi pi-info-circle" class="not-hover:text-gray-200!" rounded variant="text"
                severity="secondary" roundedaria-label="Info" size="small" @click="observationDialogVisible = true" />
            </div>
            <div class="flex flex-col items-center p-4 gap-2 ml-auto">
              <div class="flex grow">
                <BestPhotoTag v-if="isStarted" />
                <div v-if="!isStarted" class="flex gap-2">
                  <Button label="Not an insect" severity="danger" icon="pi pi-times" outlined
                    class="not-hover:text-white!" @click="confirmNotInsect($event)"
                    :loading="isSubmittingNotInsect || loading" />
                  <Button v-if="!isStarted" label="Annotate this picture" icon="pi pi-arrow-right" iconPos="right"
                    @click="startAnnotation" :loading="loading" />
                </div>
              </div>
              <div v-if="isStarted" class="flex flex-row ml-auto">
                <Button label="Show all" icon="pi pi-external-link" severity="contrast"
                  @click="showGalleriaFullscreen = true" />
              </div>
            </div>
          </div>
        </template>
      </Galleria>
      <div class="flex flex-col w-200 h-full p-4 transition-all duration-500 ease-in-out"
        :class="{ 'w-0! p-0!': !isStarted }">
        <div v-if="isStarted" class="flex flex-col h-full">
          <div class="flex flex-row gap-2 items-center mb-4 ">
            <h4 class="m-0!">New annotation</h4>
            <AnnotationTypeTag v-if="isExtended" class="h-min" :type="assignment.annotation_type" />
            <div class="flex flex-row ml-auto">
              <Button :icon="isFavourite ? 'pi pi-heart-fill' : 'pi pi-heart'" severity="danger" variant="text" rounded
                aria-label="Mark as favorite" @click="isFavourite = !isFavourite" />
              <Button :icon="isFlagged ? 'pi pi-flag-fill' : 'pi pi-flag'" severity="danger" variant="text" rounded
                aria-label="Mark as flagged" @click="isFlagged = !isFlagged" />
              <Button icon="pi pi-times" severity="secondary" variant="text" rounded aria-label="Cancel"
                @click="cancelAnnotation" />
            </div>
          </div>
          <AnnotationForm v-if="activePhoto" :observation="assignment.observation" :best-photo="activePhoto"
            :annotation-type="assignment.annotation_type" :isFlagged="isFlagged" :isFavourite="isFavourite"
            @submit="onSubmitAnnotation" />
        </div>
      </div>
    </div>

    <AnnotationGalleriaFullScreen :photos="assignment.observation.photos" v-model:visible="showGalleriaFullscreen"
      :best-photo="activePhoto" />
  </div>

  <Dialog v-model:visible="observationDialogVisible" modal header="Observation info" class="w-150">
    <ObservationInfoData :observation="assignment!.observation" />
  </Dialog>
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { Magnifier } from 'vue3-zoomer';

import { AnnotationType } from 'mosquito-alert';
import type { Assignment, AnnotationRequest } from 'mosquito-alert';

import AnnotationForm from './AnnotationForm.vue';
import AnnotationTypeTag from './AnnotationTypeTag.vue';
import AnnotationGalleriaFullScreen from './AnnotationGalleriaFullScreen.vue';
import ObservationInfoData from '../observations/ObservationInfoData.vue';
import BestPhotoTag from '../photos/BestPhotoTag.vue';
import { identificationTasksApi } from '@/services/apiService';

const confirm = useConfirm();
const toast = useToast();

const isStarted = ref(false);
const isFlagged = ref(false);
const isFavourite = ref(false);
const activePhotoIndex = ref(0);
const showGalleriaFullscreen = ref(false);
const observationDialogVisible = ref(false);
const isSubmittingNotInsect = ref(false);

const activePhoto = computed(() => {
  return props.assignment.observation.photos[activePhotoIndex.value];
});

const isExtended = computed(() => {
  return props.assignment.annotation_type === AnnotationType.Long;
});

defineOptions({ inheritAttrs: false })

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
    isFavourite.value = false; // Reset favourite state
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

const confirmNotInsect = (event: MouseEvent) => {
  isSubmittingNotInsect.value = true;
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: 'Are you sure you want to mark this image as not an insect?',
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Accept',
      severity: 'danger'
    },
    accept: () => {
      const annotationRequest = <AnnotationRequest>{
        classification: null,
      }
      identificationTasksApi.annotationsCreate({
        observationUuid: props.assignment.observation.uuid,
        annotationRequest: annotationRequest,
      }).then(() => {
        toast.add({ severity: 'info', summary: 'Annotation rejected', detail: 'Marked as not an insect', life: 3000 });
        onSubmitAnnotation(true);
      }).catch(() => {
        toast.add({ severity: 'danger', summary: 'Failed', detail: 'Annotation failed', life: 3000 });
      })
    },
    reject: () => { }
  });
  isSubmittingNotInsect.value = false;
}

</script>
