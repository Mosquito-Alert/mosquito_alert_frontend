<template>
  <Form :resolver @submit="onFormSubmit" class="flex flex-col gap-4 h-full overflow-hidden" @keydown.enter.prevent>
    <div class="flex flex-col overflow-auto gap-3 h-full">
      <TaxonTagSelector v-model="selectedTaxon">
        <template #selectedIcon>
          <i v-if="isHighConfidence" class="pi pi-angle-double-up text-green-700" />
        </template>
      </TaxonTagSelector>
      <div class="flex flex-row">
        <FormField v-slot="$field" name="isHighConfidence" :initial-value="false" class="flex items-center gap-2">
          <label>High confidence?</label>
          <ToggleSwitch v-model="isHighConfidence" />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
          </Message>
        </FormField>
        <FormField v-slot="$field" name="isDecisive" :initial-value="false" class="flex ml-auto items-center gap-2">
          <label>Is decisive?</label>
          <ToggleSwitch v-model="isDecisive" :disabled="isFlagged" />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
          </Message>
        </FormField>
      </div>

      <div v-if="isExtended" class="flex flex-col w-full">
        <Divider />
        <div class="flex flex-col gap-2 w-full">
          <label for="sexRadioButton">
            <span>Sex</span>
          </label>
          <div class="flex items-center w-full">
            <FormField v-slot="$field" name="sex" :initialValue="selectedSex" class="flex flex-col gap-1 w-full">
              <AnnotationSexRadioButton v-model="selectedSex" id="sexRadioButton" class="w-full" />
              <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
              </Message>
            </FormField>
            <div class="flex h-full transition-all duration-500 ease-in-out overflow-hidden"
              :class="{ 'w-0': !isFemale, 'w-full': isFemale }">
              <Divider layout="vertical" />
              <div v-show="isFemale" class="flex justify-center items-center w-full">
                <div class="flex flex-col gap-2 w-full">
                  <FormField v-slot="$field" name="bloodFeed" :initialValue="false" class="flex flex-row gap-1">
                    <label>Is blood feed?</label>
                    <ToggleSwitch />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                      $field.error?.message }}
                    </Message>
                  </FormField>
                  <FormField v-slot="$field" name="isGravid" :initialValue="false" class="flex flex-row gap-1">
                    <label>Is gravid?</label>
                    <ToggleSwitch />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{
                      $field.error?.message }}
                    </Message>
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Divider v-if="isExtended" />

      <FormField v-slot="$field" v-if="isExtended" name="publicNote" class="flex flex-col gap-2 w-full">
        <div class="flex items-center">
          <label>Public note</label>
          <div class="flex ml-auto gap-1 items-center">
            <span class="text-surface-500 dark:text-surface-300">Templates: </span>
            <Button icon="pi pi-star" severity="help" size="small" variant="outlined"
              v-tooltip.top="'Great picture!'" />
            <Button icon="pi pi-thumbs-up" severity="help" size="small" variant="outlined"
              v-tooltip.top="'Species pattern found in thorax.'" />
            <Button icon="pi pi-thumbs-down" severity="help" size="small" variant="outlined"
              v-tooltip.top="'Species pattern not found.'" />
            <Button icon="pi pi-times-circle" severity="help" size="small" variant="outlined"
              v-tooltip.top="'Other insect.'" />
          </div>
        </div>
        <Textarea autoResize rows="5" />
        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" v-if="isExtended" name="internalNote" class="flex flex-col gap-2 w-full">
        <label>Internal note <span class="text-surface-500 dark:text-surface-300 italic">(Optional)</span></label>
        <Textarea autoResize rows="3" />
        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
        </Message>
      </FormField>
      <Divider />

      <FormField v-slot="$field" name="tags" :initial-value="[]" class="flex flex-col gap-2 w-full">
        <label>Tags <span class="text-surface-500 dark:text-surface-300 italic">(Optional)</span></label>
        <AutoComplete v-model="selectedTags" :typeahead="false" multiple fluid @keydown="handleKeyDownTags" />
        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
        </Message>
      </FormField>
    </div>
    <div class="flex gap-2 w-full self-end">
      <Button :disabled="!selectedTaxon" class="w-1/3" type="submit" label="Submit" icon="pi pi-upload" iconPos="right"
        variant="outlined" @click="continueAfterSubmit = false" :loading="isSubmitting" />
      <Button :disabled="!selectedTaxon" class="w-full" type="submit" label="Submit & continue" icon="pi pi-upload"
        iconPos="right" @click="continueAfterSubmit = true" :loading="isSubmitting" />
    </div>
  </Form>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Form } from '@primevue/forms';
import { useToast } from 'primevue/usetoast';

import type { Observation, SimplifiedObservationWithPhotos, Photo, SimplePhoto, Taxon, AnnotationRequest, AnnotationClassificationRequest, AnnotationFeedbackRequest } from 'mosquito-alert';
import { AnnotationClassificationConfidenceLabel } from 'mosquito-alert';
import { AssignmentAnnotationType } from 'mosquito-alert';

import TaxonTagSelector from '../taxa/TaxonTagSelector.vue';
import AnnotationSexRadioButton from './AnnotationSexRadioButton.vue';
import type { Sex } from './AnnotationSexRadioButton.vue';
import { identificationTasksApi } from '@/services/apiService';

const toast = useToast();

const isHighConfidence = ref<boolean>(false);
const isDecisive = ref<boolean>(false);
const selectedTaxon = ref<Taxon>();
const selectedSex = ref<Sex>('unknown');
const selectedTags = ref<string[]>([]);

const continueAfterSubmit = ref<boolean>(false);

const isSubmitting = ref<boolean>(false);

const props = withDefaults(defineProps<{
  observation: Observation | SimplifiedObservationWithPhotos,
  bestPhoto?: SimplePhoto | Photo,
  annotationType: AssignmentAnnotationType,
  isFlagged?: boolean,
  canSetIsDecisive?: boolean
}>(), {
  isFlagged: false,
  canSetIsDecisive: true
});

const emit = defineEmits<{
  (e: 'submit', shouldContinue: boolean): void
}>();

const isExtended = computed(() => {
  return props.annotationType === AssignmentAnnotationType.Long;
});

const isFemale = computed(() => {
  return selectedSex.value === 'female';
})

// Watch for isFlagged changes
watch(() => props.isFlagged, (newVal) => {
  if (newVal) {
    isDecisive.value = false;
  }
});

const handleKeyDownTags = (event) => {
  const input = event.target.value;
  console.log(selectedTags.value);
  if (event.key === ',') {
    event.preventDefault(); // prevent the comma from being typed
    const value = input.trim().replace(/,$/, '');
    if (value && !selectedTags.value.includes(value)) {
      console.log(value);
      selectedTags.value.push(value);
    }
    event.target.value = ''; // clear the input manually
  }
};

const resolver = ({ values }) => {
  const errors = {};

  if (!values.publicNote) {
    errors.publicNote = [{ message: 'Public note is required.' }];
  }

  return {
    values, // (Optional) Used to pass current form values to submit event.
    errors
  };
};

const onFormSubmit = ({ valid, values }) => {
  if (valid) {
    isSubmitting.value = true;
    const annotationRequest = <AnnotationRequest>{
      best_photo_uuid: props.bestPhoto?.uuid,
      classification: <AnnotationClassificationRequest>{
        taxon_id: selectedTaxon.value!.id,
        confidence_label: values.isHighConfidence
          ? AnnotationClassificationConfidenceLabel.Definitely
          : AnnotationClassificationConfidenceLabel.Probably
      },
      feedback: {
        public_note: values.privateNote,
        internal_note: values.internalNote
      } as AnnotationFeedbackRequest,
      is_flagged: props.isFlagged,
      is_decisive: values.isDecisive,
      tags: selectedTags.value
    }
    identificationTasksApi.annotationsCreate({
      observationUuid: props.observation.uuid,
      annotationRequest: annotationRequest,
    }).then(() => {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Annotation created', life: 3000 });
      emit('submit', continueAfterSubmit.value);
    }).catch(() => {
      toast.add({ severity: 'danger', summary: 'Failed', detail: 'Annotation failed', life: 3000 });
    }).finally(() => {
      isSubmitting.value = false;
    });
  }
};

</script>
