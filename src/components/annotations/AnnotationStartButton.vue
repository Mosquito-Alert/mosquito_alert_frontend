<template>
  <Button v-if="$can('add', 'Annotation')" label="Start annotating" icon="pi pi-arrow-right" iconPos="right"
    :loading="isLoading" @click="onStartAnnotationClicked" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'

import { useToast } from "primevue/usetoast";

import { useAssignmentStore } from '@/stores/assignmentStore';

const router = useRouter()
const toast = useToast();
const assignmentStore = useAssignmentStore();

const isLoading = ref<boolean>(false);

const onStartAnnotationClicked = async () => {
  try {
    isLoading.value = true;
    await assignmentStore.fetchNewAssignment();
  } catch (error) {
    toast.add(
      { severity: 'error', summary: 'Error', detail: error, life: 3000 }
    )
    return;
  } finally {
    isLoading.value = false;
  }

  const assignment = assignmentStore.assignment
  if (assignment) {
    router.push({
      name: 'annotate_identification_task',
      params: {
        observationUuid: assignment.observation.uuid
      }
    })
  } else {
    toast.add(
      { severity: 'info', summary: 'Task queue empty', detail: 'No identification tasks available at the moment', life: 3000 }
    )
  }
}

</script>
