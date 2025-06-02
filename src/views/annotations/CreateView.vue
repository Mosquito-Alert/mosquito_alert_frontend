<template>
  <div class="flex flex-col flex-1 h-[calc(100dvh-8rem)]">
    <AnnotationCreator v-if="assignment" class="flex-1 h-px w-full" :assignment="assignment" :loading="loading"
      @on-start-annotation="annotationStarted = true" @on-cancel-annotation="annotationStarted = false"
      @on-submit-annotation="onSubmitAnnotation" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useToast } from "primevue/usetoast";

import type { Assignment } from 'mosquito-alert';

import AnnotationCreator from '@/components/annotations/AnnotationCreator.vue';
import { useAssignmentStore } from '@/stores/assignmentStore';

const router = useRouter();
const route = useRoute();

const toast = useToast();

const assignmentStore = useAssignmentStore();
const assignment = ref<Assignment>();
const annotationStarted = ref(false);

const observationIsFavorited = ref(false);

const loading = ref(false);

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

const onSubmitAnnotation = (shouldContinue: boolean) => {
  annotationStarted.value = false;
  if (shouldContinue) {
    fetchNewAssignment();
  } else {
    router.push({ name: 'list_annotations' });
  }
}

</script>
