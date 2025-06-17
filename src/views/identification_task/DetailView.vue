<template>
  <div class="card">
    <div class="flex items-center">
      <div class="font-medium text-3xl text-surface-500 dark:text-surface-300 mb-4">
        <span>Identification task: </span>
        <span class="text-surface-900 dark:text-surface-0">{{ identificationTask?.observation.uuid }}</span>
      </div>
      <div class="ml-auto">
        <Tag v-if='identificationTask?.status' :value="identificationTask?.status?.toUpperCase()"
          :severity="getStatusSeverity(identificationTask?.status)" />
      </div>
    </div>

    <div class="flex items-center mb-4 gap-2">
      <Tag :severity="identificationTask?.review ? 'info' : 'warn'"
        :value="identificationTask?.review ? formatLocalDateTime(identificationTask.review.created_at) : 'Not reviewed'"
        v-tooltip.bottom="identificationTask?.review ? 'Review datetime' : undefined">
        <template #icon>
          <span class="material-symbols-outlined p-tag-icon">
            {{ identificationTask?.review ? 'verified' : 'verified_off' }}
          </span>
        </template>
      </Tag>
      <Tag v-if='identificationTask?.is_safe' icon="pi pi-shield" value='Safe content' severity="success" />
      <Tag v-if='identificationTask?.is_flagged' icon="pi pi-flag" value='Flagged' severity="danger" />
      <div class="ml-auto text-surface-400 dark:text-surface-400 flex flex-col">
        <span>Last update: {{ formatLocalDateTime(identificationTask?.updated_at!) }}</span>
      </div>
    </div>
    <ul v-if="identificationTask?.result.source" class="list-none p-0 m-0">
      <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
        <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">Classification
        </div>
        <div class="flex text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">
          <IdentificationTaskResultTag :result="identificationTask?.result" />
        </div>
      </li>
      <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
        <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">Public note</div>
        <div class="text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">{{
          identificationTask?.public_note }}</div>
      </li>
    </ul>
  </div>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 xl:col-span-6">
      <div class="card">
        <h5>Observation</h5>
        <ObservationInfoData v-if="identificationTask?.observation" :observation="identificationTask?.observation" />
      </div>

      <div v-if="sortedAnnotations.length" class="card">
        <div class="flex items-center mb-4">
          <h5 class="my-0"><i class="pi pi-users" /> Annotations</h5>
          <RouterLink class='ml-auto'
            :to="{ name: 'annotate_identification_task', params: { observationUuid: props.observationUuid } }">
            <!-- TODO: if user is in list, do not show button -->
            <!-- <Button class="ml-auto" icon="pi pi-plus" label="Add" /> -->
          </RouterLink>
        </div>
        <div class="flex flex-col items-center mb-4 gap-2">
          <AnnotationPanel v-for="annotation in sortedAnnotations" :key="annotation.id" :annotation="annotation"
            :collapsed="!(annotation.feedback?.public_note || annotation.feedback?.internal_note)" class="w-full" />
        </div>
      </div>

    </div>
    <div class="col-span-12 xl:col-span-6">
      <div class="card">
        <h5>Photos</h5>
        <Galleria :value="photosWithPrediction" :numVisible="5" :circular="true" :showItemNavigators="true"
          :responsiveOptions="responsiveOptions" :showItemNavigatorsOnHover="true">
          <template #item="slotProps">
            <figure class="relative">
              <Image :src="slotProps.item.url" class="w-full h-full" preview />
              <PhotoPredictionBbox v-if="slotProps.item.prediction" :prediction="slotProps.item.prediction" />
              <figcaption v-if="slotProps.item.uuid === identificationTask?.public_photo.uuid"
                class="absolute top-2 right-2 p-2 rounded-md">
                <Tag icon="pi pi-sparkles" severity="success" value="Best photo" />
              </figcaption>
            </figure>
          </template>
          <template #thumbnail="slotProps">
            <!-- <img :src="slotProps.item.url" class="h-32 object-cover" /> -->
            <figure class="relative">
              <Image :src="slotProps.item.url" image-class="h-32 object-cover" />
              <PhotoPredictionBbox v-if="slotProps.item.prediction" :prediction="slotProps.item.prediction"
                :showLabel="false" />
              <figcaption v-if="slotProps.item.uuid === identificationTask?.public_photo.uuid"
                class="absolute top-2 right-2 rounded-md">
                <Tag icon="pi pi-sparkles" severity="success" rounded />
              </figcaption>
            </figure>
          </template>
        </Galleria>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

import { identificationTasksApi } from '@/services/apiService';
import type { IdentificationTask, SimplePhoto, Annotation, PhotoPrediction } from 'mosquito-alert';

import { getStatusSeverity } from '@/utils/IdentificationTaskUtils';
import { formatLocalDateTime } from '@/utils/DateUtils';

import AnnotationPanel from '@/components/annotations/AnnotationPanel.vue';
import IdentificationTaskResultTag from '@/components/IdentificationTaskResultTag.vue';
import ObservationInfoData from '@/components/observations/ObservationInfoData.vue';
import PhotoPredictionBbox from '@/components/predictions/PhotoPredictionBbox.vue';

const props = withDefaults(defineProps<{
  observationUuid: string,
  annotating?: boolean,
}>(), {
  annotating: false
})

const loading = ref<boolean>(false);
const identificationTask = ref<IdentificationTask>();
const annotations = ref<Annotation[]>([]);
const photoPredictions = ref<PhotoPrediction[]>([]);

const sortedAnnotations = computed(() =>
  [...annotations.value].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
)

const photosWithPrediction = computed<(SimplePhoto & { prediction: PhotoPrediction | null })[]>(() => {
  const photos = identificationTask.value?.observation.photos ?? [];
  return photos.map(photo => {
    const prediction = photoPredictions.value.find(p => p.photo.uuid === photo.uuid) || null;
    return {
      ...photo,
      prediction,
    };
  });
})

const showCreateStepper = ref<boolean>(props.annotating);
// Update showStepper when annotating changes
watch(() => props.annotating, (newVal) => {
  showCreateStepper.value = newVal
})

const responsiveOptions = ref([
  {
    breakpoint: '1300px',
    numVisible: 4
  },
  {
    breakpoint: '575px',
    numVisible: 1
  }
]);

onMounted(() => {
  fetchIdentificationTask();
  fetchAnnotations();
  fetchPhotoPredictions();
});

function fetchIdentificationTask() {
  loading.value = true;
  identificationTasksApi.retrieve({ observationUuid: props.observationUuid }).then(
    (response) => {
      identificationTask.value = response.data || undefined;
      loading.value = false;
    }
  ).catch((error) => {
    console.error(error);
    loading.value = false;  // Ensure loading is set to false even if there is an error
  });
}

function fetchAnnotations() {
  loading.value = true;
  identificationTasksApi.annotationsList({ observationUuid: props.observationUuid }).then(
    (response) => {
      annotations.value = response.data.results || [];
      loading.value = false;
    }
  ).catch((error) => {
    console.error(error);
    loading.value = false;  // Ensure loading is set to false even if there is an error
  });
}

function fetchPhotoPredictions() {
  loading.value = true;
  identificationTasksApi.predictionsList({ observationUuid: props.observationUuid }).then(
    (response) => {
      photoPredictions.value = response.data.results || [];
      loading.value = false;
    }
  ).catch((error) => {
    console.error(error);
    loading.value = false;  // Ensure loading is set to false even if there is an error
  });
}

</script>
