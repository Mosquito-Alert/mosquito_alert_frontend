<template>
  <figure class="relative">
    <router-link :to="{ name: 'identification_task', params: { observationUuid: task.observation.uuid } }"
      class="relative">
      <div v-if="isSubmittingReview" class="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
        <ProgressSpinner />
      </div>
      <Image :src="task.public_photo.url"
        image-class="aspect-square object-cover w-full transition-all duration-300 cursor-pointer"
        class="group-hover:brightness-50" />
    </router-link>
    <figcaption class="absolute top-2 left-2 text-white rounded-md gap-1">
      <IdentificationTaskStatusTag v-if="task.status" :status="task.status" />
    </figcaption>
    <figcaption v-if="task.observation.location.country" class="absolute top-2 right-2 rounded-md gap-1 flex flex-col">
      <CountryTag v-if="task.observation.location.country" :country="task.observation.location.country"
        class="text-white bg-black/50 rounded-md p-2" />
      <div class="gap-1 flex justify-end">
        <Tag v-if="task.is_flagged" icon="pi pi-flag" severity="danger" />
        <Tag v-if="task.is_safe" icon="pi pi-shield" severity="success" />
      </div>
    </figcaption>
    <figcaption v-if="task.result" class="absolute bottom-0 left-0 p-2">
      <IdentificationTaskResultTag class="bg-white/80!" :result="task.result" />
    </figcaption>
    <figcaption v-else-if="$can('add', 'Review') && !task.review"
      class="absolute bottom-0 left-0 p-2 flex gap-2 w-full bg-linear-to-t from-black to-transparent">
      <TaxonTreeSelect class="flex-1" placeholder="Select taxon" @on-change="(taxon) => submitReview(taxon)" />
      <AnnotationNotAnInsectButton :observation="task.observation" />
    </figcaption>
  </figure>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

import type { IdentificationTask, Taxon, AnnotationRequest, AnnotationClassificationRequest } from 'mosquito-alert';
import { AnnotationClassificationConfidenceLabel } from 'mosquito-alert';

import CountryTag from '@/components/countries/CountryTag.vue';
import AnnotationNotAnInsectButton from '@/components/annotations/AnnotationNotAnInsectButton.vue';
import IdentificationTaskStatusTag from '@/components/identificationTasks/IdentificationTaskStatusTag.vue';
import IdentificationTaskResultTag from '@/components/identificationTasks/IdentificationTaskResultTag.vue';
import TaxonTreeSelect from '@/components/taxa/TaxonTreeSelect.vue';

import { identificationTasksApi } from '@/services/apiService';

const toast = useToast();

const props = defineProps<{
  task: IdentificationTask
}>()

const emit = defineEmits<{
  (e: 'onReviewSuccess'): void,
  (e: 'onReviewFailure'): void
}>()

const isSubmittingReview = ref<boolean>(false);

const submitReview = (taxon: Taxon | undefined) => {
  if (!taxon) return;

  isSubmittingReview.value = true;
  const annotationRequest = <AnnotationRequest>{
    best_photo_uuid: props.task.public_photo.uuid,
    classification: <AnnotationClassificationRequest>{
      taxon_id: taxon.id,
      confidence_label: AnnotationClassificationConfidenceLabel.Definitely
    },
    is_decisive: true,
    observation_flags: {
      is_visible: true
    },
  }
  identificationTasksApi.annotationsCreate({
    observationUuid: props.task.observation.uuid,
    annotationRequest: annotationRequest,
  }).then(() => {
    toast.add({ severity: 'success', summary: 'Success', detail: `Annotated as '${taxon.name}''`, life: 3000 });
    emit('onReviewSuccess')
  }).catch(() => {
    toast.add({ severity: 'danger', summary: 'Failed', detail: 'Annotation failed', life: 3000 });
    emit('onReviewFailure')
  }).finally(() => {
    isSubmittingReview.value = false;
  });

}

</script>
