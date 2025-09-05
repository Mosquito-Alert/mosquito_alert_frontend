<template>
  <Button label="Not an insect" severity="danger" icon="pi pi-times" outlined class="not-hover:text-white!"
    @click="confirmNotInsect($event)" :loading="isSubmitting || loading" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import { identificationTasksApi } from '@/services/apiService';
import type { Observation, AssignedObservation, SimplifiedObservationWithPhotos, AnnotationRequest } from 'mosquito-alert';

const confirm = useConfirm();
const toast = useToast();

const props = withDefaults(defineProps<{
  observation: Observation | AssignedObservation | SimplifiedObservationWithPhotos,
  loading?: boolean
  onConfirm?: () => Promise<void> | void
}>(), {
  loading: false
});

const emit = defineEmits<{
  (e: 'onSubmitSuccess'): void
  (e: 'onSubmitFailure'): void
}>()

const isSubmitting = ref<boolean>(false)

const confirmNotInsect = (event: MouseEvent) => {
  isSubmitting.value = true;
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
    accept: async () => {
      try {
        if (props.onConfirm) {
          await props.onConfirm();
        } else {
          const annotationRequest = <AnnotationRequest>{
            classification: null,
          }
          try {
            await identificationTasksApi.annotationsCreate({
              observationUuid: props.observation.uuid,
              annotationRequest: annotationRequest,
            });
            toast.add({ severity: 'info', summary: 'Observation rejected', detail: 'Marked as not an insect', life: 3000 });
          } catch {
            toast.add({ severity: 'danger', summary: 'Failed', detail: 'Annotation failed', life: 3000 });
          }
        }
        emit('onSubmitSuccess')
      } catch {
        emit('onSubmitFailure')
      }
    },
    reject: () => { }
  });
  isSubmitting.value = false;
}
</script>
