<template>
  <Message v-if="isReviewing" class="mb-2 sticky! top-20 z-1101" severity="warn" icon="pi pi-pencil" size="large" :pt="{
    text: 'flex flex-row w-full items-center',
  }">
    <span>Review mode</span>
    <div class="flex ml-auto gap-2">
      <Button severity="secondary" label="Cancel" icon="pi pi-times" outlined :loading="isSubmittingReview || loading"
        @click="isReviewing = false" />
      <Button severity="primary" label="Submit changes" icon="pi pi-check" :loading="isSubmittingReview || loading"
        @click="submitReview(CreateOverwriteReviewRequestAction.Overwrite)" />
    </div>
  </Message>

  <div class="card">
    <div class="flex items-center">
      <div class="font-medium text-3xl text-surface-500 dark:text-surface-300 mb-4">
        <span>Identification task: </span>
        <span class="text-surface-900 dark:text-surface-0">{{ identificationTask?.observation.uuid }}</span>
      </div>
      <div class="ml-auto">
        <IdentificationTaskStatusTag v-if="identificationTask" :status="identificationTask?.status" />
      </div>
    </div>

    <div class="flex items-center mb-4 gap-2">
      <IdentificationTaskReviewTag v-if="identificationTask" :review="identificationTask.review" />

      <IdentificationTaskIsSafeSelect v-if="isReviewing" v-model="editIdentificationTask!.is_safe"
        :disabled="isReviewNotInsect" />
      <IdentificationTaskIsSafeTag v-else :is-safe="identificationTask?.is_safe || false" />

      <Tag v-if='identificationTask?.is_flagged' icon="pi pi-flag" value='Flagged' severity="danger" />
      <div class="ml-auto text-surface-400 dark:text-surface-400 flex flex-col">
        <span>Last update: {{ formatLocalDateTime(identificationTask?.updated_at!) }}</span>
      </div>
    </div>
    <ul v-if="identificationTask?.result || isReviewing" class="list-none p-0 m-0">
      <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
        <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-1/12 font-medium">Classification
        </div>
        <div class="flex text-surface-900 dark:text-surface-0 w-full md:w-11/12 md:order-none order-1">
          <template v-if="isReviewing">
            <div class="flex flex-col gap-2 w-full">
              <div class="flex gap-2">
                <TaxonTagSelector :model-value="editIdentificationTask!.result?.taxon"
                  @update:model-value="val => editIdentificationTask!.result!.taxon = <SimpleTaxon>val"
                  :disabled="isReviewNotInsect">
                  <template #selectedIcon>
                    <i v-if="editIdentificationTask!.result?.is_high_confidence"
                      class="pi pi-angle-double-up text-green-700" />
                  </template>
                </TaxonTagSelector>
              </div>
              <div class="flex flex-row">
                <div class="flex flex-row items-center gap-2">
                  <span>High confidence?</span>
                  <ToggleSwitch :model-value="editIdentificationTask!.result?.is_high_confidence"
                    @update:model-value="val => editIdentificationTask!.result!.is_high_confidence = val"
                    :disabled="isReviewNotInsect" />
                </div>
                <div class="flex flex-row items-center gap-2 ml-auto">
                  <span :class="isReviewNotInsect ? 'text-red-500' : ''">Not an insect</span>
                  <ToggleSwitch :model-value="editIdentificationTask!.result?.taxon == null"
                    @update:model-value="val => isReviewNotInsect = val" />
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <IdentificationTaskResultTag v-if="identificationTask?.result" :result="identificationTask?.result" />
          </template>
        </div>
      </li>
      <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
        <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-1/12 font-medium">Public note</div>
        <div class="text-surface-900 dark:text-surface-0 w-full md:w-11/12 md:order-none order-1">
          <template v-if="isReviewing">
            <Textarea fluid autoResize v-model="editIdentificationTask!.public_note" />
          </template>
          <template v-else>
            {{ identificationTask?.public_note }}
          </template>
        </div>
      </li>
    </ul>
  </div>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 xl:col-span-6">
      <div class="card">
        <h5>Observation</h5>
        <ObservationInfoData v-if="identificationTask?.observation" :observation="identificationTask?.observation" />
      </div>
      <div class="card">
        <div class="flex flex-col mb-4 gap-2">
          <div class="flex items-start gap-2">
            <h5 class="my-0!"><i class="pi pi-users" /> Annotations</h5>
            <!-- TODO: only if can annotate -->
            <RouterLink v-if="!userHasAnnotated && !identificationTask?.review" class='ml-auto'
              :to="{ name: 'annotate_identification_task', params: { observationUuid: props.observationUuid } }">
              <!-- <Button class="ml-auto" icon="pi pi-plus" label="Add" /> -->
            </RouterLink>
          </div>
          <IdentificationTaskReviewActionMessage
            v-if="identificationTask?.review && identificationTask?.result?.source == IdentificationTaskResultSource.Expert"
            :review="identificationTask?.review" />
        </div>
        <div class="flex flex-col items-center gap-2">
          <span v-if="sortedAnnotations.length === 0" class="text-lg text-gray-600 dark:text-gray-400">
            No annotations given for this identification task.
          </span>
          <AnnotationPanel v-for="annotation in sortedAnnotations" :key="annotation.id" :annotation="annotation"
            :collapsed="!(annotation.feedback?.public_note || annotation.feedback?.internal_note)" class="w-full" />
        </div>
      </div>

    </div>
    <div class="col-span-12 xl:col-span-6">
      <div class="card">
        <div class="flex flex-col mb-4 gap-2">
          <h5 class="my-0!">Photos</h5>
          <IdentificationTaskReviewActionMessage
            v-if="identificationTask?.review && identificationTask?.result?.source == IdentificationTaskResultSource.Ai"
            :review="identificationTask?.review" />
        </div>
        <Galleria :value="photosWithPrediction" :numVisible="numVisible" :circular="true" :showItemNavigators="true"
          :responsiveOptions="responsiveOptions" :showItemNavigatorsOnHover="true"
          :showThumbnailNavigators="photosWithPrediction.length > numVisible">
          <template #item="slotProps">
            <Image :src="slotProps.item.url" class="justify-center w-full h-full" preview>
              <template #image>
                <figure class="relative">
                  <img :src="slotProps.item.url" class="w-full h-full" />
                  <PhotoPredictionBbox v-if="slotProps.item.prediction" :prediction="slotProps.item.prediction" />
                  <figcaption
                    v-if="slotProps.item.uuid === (isReviewing ? editIdentificationTask?.public_photo.uuid : identificationTask?.public_photo.uuid)"
                    class="absolute top-2 right-2 rounded-md">
                    <BestPhotoTag />
                  </figcaption>
                </figure>
              </template>
            </Image>
          </template>
          <template #thumbnail="slotProps">
            <!-- <img :src="slotProps.item.url" class="h-32 object-cover" /> -->
            <Image :src="slotProps.item.url">
              <template #image>
                <figure class="relative">
                  <img :src="slotProps.item.url" class="h-32 object-cover" />
                  <PhotoPredictionBbox v-if="slotProps.item.prediction" :prediction="slotProps.item.prediction"
                    :showLabel="false" />
                  <figcaption class="flex absolute top-2 right-2 rounded-md gap-1">
                    <RadioButton v-if="isReviewing" v-model="editIdentificationTask!.public_photo.uuid"
                      :value="slotProps.item.uuid" :inputId="slotProps.item.uuid" name="radio-BestPhoto" />
                    <Tag
                      v-if="slotProps.item.uuid === (isReviewing ? editIdentificationTask?.public_photo.uuid : identificationTask?.public_photo.uuid)"
                      icon="pi pi-sparkles" severity="success" rounded />
                  </figcaption>
                </figure>
              </template>
            </Image>
          </template>
        </Galleria>
      </div>
    </div>
  </div>

  <ReviewDialog v-if="$can('add', subject('Review', { 'identification_task': identificationTask }))"
    :identification-task="identificationTask" :visible="!isReviewing" :loading="isSubmittingReview || loading"
    @agree="submitReview(CreateAgreeReviewRequestAction.Agree)" @disagree="isReviewing = true" />

</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { subject } from '@casl/ability';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

import { useToast } from "primevue/usetoast";

import { identificationTasksApi } from '@/services/apiService';
import { useUserStore } from '@/stores/userStore';
import type { IdentificationTask, SimplePhoto, Annotation, PhotoPrediction, IdentificationTasksApiReviewCreateRequest, CreateAgreeReviewRequest, CreateOverwriteReviewRequest, MetaCreateIdentificationTaskReviewRequest, SimpleTaxon } from 'mosquito-alert';
import { AnnotationClassificationConfidenceLabel, CreateAgreeReviewRequestAction, CreateOverwriteReviewRequestAction, IdentificationTaskResultSource } from 'mosquito-alert';

import { formatLocalDateTime } from '@/utils/DateUtils';

import AnnotationPanel from '@/components/annotations/AnnotationPanel.vue';
import IdentificationTaskIsSafeTag from '@/components/identificationTasks/IdentificationTaskIsSafeTag.vue';
import IdentificationTaskIsSafeSelect from '@/components/identificationTasks/IdentificationTaskIsSafeSelect.vue';
import IdentificationTaskResultTag from '@/components/identificationTasks/IdentificationTaskResultTag.vue';
import IdentificationTaskReviewTag from '@/components/identificationTasks/IdentificationTaskReviewTag.vue';
import IdentificationTaskReviewActionMessage from '@/components/identificationTasks/IdentificationTaskReviewActionMessage.vue';
import IdentificationTaskStatusTag from '@/components/identificationTasks/IdentificationTaskStatusTag.vue';
import ObservationInfoData from '@/components/observations/ObservationInfoData.vue';
import BestPhotoTag from '@/components/photos/BestPhotoTag.vue';
import PhotoPredictionBbox from '@/components/predictions/PhotoPredictionBbox.vue';
import ReviewDialog from '@/components/reviews/ReviewDialog.vue';
import TaxonTagSelector from '@/components/taxa/TaxonTagSelector.vue';

const userStore = useUserStore();
const toast = useToast();

const props = withDefaults(defineProps<{
  observationUuid: string,
  annotating?: boolean,
}>(), {
  annotating: false
})

const isReviewing = ref<boolean>(false);
const isReviewNotInsect = ref<boolean>(false);
const isSubmittingReview = ref<boolean>(false);
const editIdentificationTask = ref<IdentificationTask>();

watch(isReviewing, (newValue) => {
  if (identificationTask.value && newValue) {
    editIdentificationTask.value = JSON.parse(JSON.stringify(identificationTask.value));
  } else {
    editIdentificationTask.value = undefined;
  }
  isReviewNotInsect.value = editIdentificationTask.value?.result?.taxon == null;
});

watch(isReviewNotInsect, (newValue) => {
  if (newValue) {
    editIdentificationTask.value!.result!.taxon = null
  } else {
    editIdentificationTask.value!.result!.taxon = identificationTask?.value!.result?.taxon || null;
  }
  editIdentificationTask.value!.is_safe = !newValue
});

const numVisible = ref(7);
const loading = ref<boolean>(false);
const identificationTask = ref<IdentificationTask>();
const annotations = ref<Annotation[]>([]);
const photoPredictions = ref<PhotoPrediction[]>([]);

watch(identificationTask, () => {
  fetchAnnotations();
  fetchPhotoPredictions();
})

const sortedAnnotations = computed(() =>
  [...annotations.value].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
)

const userHasAnnotated = computed(() => {
  return annotations.value.some(annotation => annotation.user.uuid === userStore.user!.uuid);
})

const photosWithPrediction = computed<(SimplePhoto & { prediction: PhotoPrediction | null })[]>(() => {
  const photos = identificationTask.value?.observation.photos ?? [];
  const bestPhotoUuid = identificationTask.value?.public_photo?.uuid;
  const mappedPhotos = photos.map(photo => {
    const prediction = photoPredictions.value.find(p => p.photo.uuid === photo.uuid) || null;
    return {
      ...photo,
      prediction,
    };
  });
  // Move the public photo to the first position
  mappedPhotos.sort((a, b) => (a.uuid === bestPhotoUuid ? -1 : b.uuid === bestPhotoUuid ? 1 : 0));

  return mappedPhotos;
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

async function submitReview(action: CreateAgreeReviewRequestAction | CreateOverwriteReviewRequestAction) {
  if (!identificationTask.value) return;

  let metaRequest: CreateAgreeReviewRequest | CreateOverwriteReviewRequest;
  switch (action) {
    case CreateAgreeReviewRequestAction.Agree:
      // Handle agree action
      metaRequest = {
        action: CreateAgreeReviewRequestAction.Agree,
      };
      break;
    case CreateOverwriteReviewRequestAction.Overwrite:
      // Handle overwrite action
      metaRequest = {
        action: CreateOverwriteReviewRequestAction.Overwrite,
        public_photo_uuid: editIdentificationTask.value!.public_photo.uuid,
        is_safe: editIdentificationTask.value!.is_safe,
        public_note: editIdentificationTask.value!.public_note,
        result: editIdentificationTask.value!.result?.taxon ? {
          taxon_id: editIdentificationTask.value!.result.taxon!.id,
          confidence_label: editIdentificationTask.value!.result.is_high_confidence
            ? AnnotationClassificationConfidenceLabel.Definitely
            : AnnotationClassificationConfidenceLabel.Probably
        } : null,
      };
      break;
    default:
      throw new Error(`Unknown action: ${action}`);
  }

  const request: IdentificationTasksApiReviewCreateRequest = {
    observationUuid: identificationTask.value.observation.uuid,
    metaCreateIdentificationTaskReviewRequest: metaRequest as MetaCreateIdentificationTaskReviewRequest
  }
  identificationTasksApi.reviewCreate(request).then(() => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Review submitted successfully.', life: 5000 });
    fetchIdentificationTask();
    isReviewing.value = false;
  }).catch((error) => {
    console.error('Error submitting review:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'There was an error submitting the review.', life: 5000 });
  }).finally(() => {
    isSubmittingReview.value = false;
  });

}

</script>
