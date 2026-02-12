<template>
  <Button v-if="$can('add', 'Review')" label="Start reviewing" icon="pi pi-arrow-right" iconPos="right"
    :loading="isLoading" @click="onStartReviewClicked" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'

import { useToast } from "primevue/usetoast";
import { IdentificationTaskDetailViewMode } from '@/enums/IdentificationTaskDetailViewMode';
import { useIdentificationTaskStore } from '@/stores/identificationTaskStore';

const router = useRouter()
const toast = useToast();
const identificationTaskStore = useIdentificationTaskStore()

const isLoading = ref<boolean>(false);

const onStartReviewClicked = async () => {
  try {
    isLoading.value = true;
    await identificationTaskStore.fetchNextIdentificationTasksToReview();
  } catch (error) {
    toast.add(
      { severity: 'error', summary: 'Error', detail: error, life: 3000 }
    )
    return;
  } finally {
    isLoading.value = false;
  }

  const identificationTaskToReview = identificationTaskStore.identificationTaskToReview
  if (identificationTaskToReview) {
    router.push({
      name: 'identification_task',
      params: {
        observationUuid: identificationTaskToReview.observation.uuid
      },
      query: {
        mode: IdentificationTaskDetailViewMode.Review
      }
    })
  } else {
    toast.add(
      { severity: 'info', summary: 'No tasks available to review', detail: 'No identification tasks available to review at the moment', life: 3000 }
    )
  }
}

</script>
