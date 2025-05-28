<template>
  <div class="flex flex-col flex-1 h-[calc(100dvh-8rem)]">
    <div class="card transition-all duration-500 ease-in-out" :class="{ 'h-0 opacity-0 p-0! m-0!': annotationStarted }">
      <div v-if="!annotationStarted" class="flex flex-row items-center gap-6">
        <div class="font-medium text-2xl text-surface-500 dark:text-surface-300">
          <span>Observation uuid: </span>
          <span class="text-surface-700 dark:text-surface-0">{{ assignment?.observation.uuid }}</span>

        </div>
        <div class="flex gap-1">
          <Button icon="pi pi-info" rounded severity="secondary" roundedaria-label="Info"
            @click="observationDialogVisible = true" size="small" />
          <Button :icon="observationIsFavorited ? 'pi pi-heart-fill' : 'pi pi-heart'" rounded severity="danger"
            variant="text" roundedaria-label="Favorite" size="small" @click="toggleObservationFavourite"
            v-tooltip.top="'Mark as favorite'" />
        </div>
        <div class="flex ml-auto gap-1">
          <Button label="Not an insect" severity="danger" icon="pi pi-times" outlined @click="confirmNotInsect($event)"
            :loading="isSubmittingNotInsect" />
        </div>
      </div>
    </div>
    <AnnotationCreator v-if="assignment" class="flex-1 h-px w-full" :assignment="assignment" :loading="loading"
      @on-start-annotation="annotationStarted = true" @on-cancel-annotation="annotationStarted = false"
      @on-submit-annotation="onSubmitAnnotation" />
  </div>

  <Dialog v-model:visible="observationDialogVisible" modal header="Observation info" class="w-150">
    <ObservationInfoData :observation="assignment!.observation" />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import type { Assignment, AnnotationRequest } from 'mosquito-alert';

import AnnotationCreator from '@/components/annotations/AnnotationCreator.vue';
import ObservationInfoData from '@/components/observations/ObservationInfoData.vue';
import { useAssignmentStore } from '@/stores/assignmentStore';
import { identificationTasksApi } from '@/services/apiService';

const router = useRouter();
const route = useRoute();

const confirm = useConfirm();
const toast = useToast();

const assignmentStore = useAssignmentStore();
const assignment = ref<Assignment>();
const annotationStarted = ref(false);

const observationIsFavorited = ref(false);

const observationDialogVisible = ref(false);

const loading = ref(false);
const isSubmittingNotInsect = ref(false);

const props = defineProps<{
  observationUuid: string,
}>();

onMounted(async () => {
  const a = assignmentStore.getAssignmentById(props.observationUuid);
  if (a) {
    assignment.value = a;
  } else {
    toast.add(
      { severity: 'error', summary: 'No assignment found', detail: 'This identification task has not been assigned to you.', life: 3000 }
    )
  }
})

watch(assignment, (newAssignment) => {
  observationIsFavorited.value = false;
  if (newAssignment?.observation.uuid && newAssignment.observation.uuid !== route.params.observationUuid) {
    router.push({
      name: 'annotate_identification_task',
      params: {
        observationUuid: newAssignment.observation.uuid,
      },
    })
  }
})

const fetchNewAssignment = async () => {
  loading.value = true;
  await assignmentStore.fetchNewAssignment();
  const nextAssignment = assignmentStore.assignment;
  if (nextAssignment) {
    assignment.value = nextAssignment;
  } else {
    toast.add({ severity: 'info', summary: 'No more assignments', detail: 'You have completed all available assignments.', life: 3000 });
    assignment.value = undefined;
  }
  loading.value = false;
}

const confirmNotInsect = (event: MouseEvent) => {
  isSubmittingNotInsect.value = false;
  confirm.require({
    target: event.currentTarget,
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
        observationUuid: props.observationUuid,
        annotationRequest: annotationRequest,
      }).then(() => {
        toast.add({ severity: 'info', summary: 'Annotation rejected', detail: 'Marked as not an insect', life: 3000 });
        fetchNewAssignment();
      }).catch(() => {
        toast.add({ severity: 'danger', summary: 'Failed', detail: 'Annotation failed', life: 3000 });
      })
    },
    reject: () => { }
  });
  isSubmittingNotInsect.value = false;
}

const toggleObservationFavourite = () => {
  if (assignment.value) {
    observationIsFavorited.value = !observationIsFavorited.value;
    const detailText = observationIsFavorited.value ? 'marked as favorite' : 'removed from favorites';
    toast.add({ severity: 'success', summary: 'Success', detail: `Observation ${detailText}`, life: 3000 });
    // assignmentStore.toggleObservationFavourite(assignment.value.observation.uuid)
    //   .then(() => {
    //     toast.add({ severity: 'success', summary: 'Success', detail: 'Observation marked as favorite', life: 3000 });
    //   })
    //   .catch(() => {
    //     toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to mark observation as favorite', life: 3000 });
    //   });
  }
}

const onSubmitAnnotation = (shouldContinue: boolean) => {
  annotationStarted.value = false;
  if (shouldContinue) {
    fetchNewAssignment();
  } else {
    router.push({ name: 'list_annotations' });
  }
}

</script>
