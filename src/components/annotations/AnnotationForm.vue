<template>
  <Form ref="form" :resolver @submit="onFormSubmit" class="flex flex-col gap-4 h-full overflow-hidden"
    @keydown.enter.prevent>
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
        <FormField v-if="$can('change', annotationSubject, 'is_decisive')" v-slot="$field" name="isExecutive"
          :initial-value="false" class="flex ml-auto items-center gap-2">
          <label>Is executive?</label>
          <ToggleSwitch v-model="isExecutive" :disabled="isFlagged" />
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
                  <FormField v-slot="$field" name="bloodFed" :initialValue="false" class="flex flex-row gap-1">
                    <label>Is blood fed?</label>
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

      <Divider />
      <FormField v-slot="$field" v-if="isExtended" name="publicNote" class="flex flex-col gap-2 w-full">
        <div class="flex items-center">
          <label>
            Public note
            <span v-if="observation.user.locale" class="text-surface-500 dark:text-surface-300">
              (Language: {{ getLanguageName(observation.user.locale) }})
            </span>
          </label>
          <div class="flex ml-auto gap-1 items-center">
            <Button icon="pi pi-sparkles" label="Generate" severity="help" @click="generatePublicNote()" rounded
              variant="outlined" :disabled="!selectedTaxon" size="small" />
          </div>
        </div>
        <Textarea v-model="publicNote" autoResize rows="5" />
        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="internalNote" class="flex flex-col gap-2 w-full">
        <label>Internal note
          <span v-if="!isInternalNoteRequired" class="text-surface-500 dark:text-surface-300 italic">
            (Optional)
          </span>
        </label>
        <Textarea autoResize rows="3" />
        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
        </Message>
      </FormField>
      <Divider />

      <FormField v-slot="$field" name="tags" :initial-value="[]" class="flex flex-col gap-2 w-full">
        <label>Tags <span class="text-surface-500 dark:text-surface-300 italic">(Optional)</span></label>
        <AutoComplete ref="tagInputFieldRef" v-model="selectedTags" :typeahead="false" multiple fluid
          @keydown="handleKeyDownTags" />
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

import { subject } from '@casl/ability';

import type { AssignedObservation, Photo, SimplePhoto, Taxon, AnnotationRequest, SpeciesClassificationRequest, AnnotationFeedbackRequest, SpeciesCharacteristicsRequest } from 'mosquito-alert';
import { AnnotationType, SpeciesClassificationConfidenceLabel, SpeciesCharacteristicsSex } from 'mosquito-alert';

import TaxonTagSelector from '../taxa/TaxonTagSelector.vue';
import AnnotationSexRadioButton from './AnnotationSexRadioButton.vue';
import { identificationTasksApi } from '@/services/apiService';
import { getPublicNote } from '@/utils/AnnotationUtils';
import { getLanguageName } from '@/utils/Utils';

const toast = useToast();

const form = ref();
const tagInputFieldRef = ref();

const isHighConfidence = ref<boolean>(false);
const isExecutive = ref<boolean>(false);
const selectedTaxon = ref<Taxon>();
const selectedSex = ref<SpeciesCharacteristicsSex | null | undefined>(undefined);
const selectedTags = ref<string[]>([]);
const publicNote = ref<string>();

const continueAfterSubmit = ref<boolean>(false);

const isSubmitting = ref<boolean>(false);

const props = withDefaults(defineProps<{
  observation: AssignedObservation,
  bestPhoto?: SimplePhoto | Photo,
  annotationType: AnnotationType,
  isVisible?: boolean,
  isFlagged?: boolean,
  isFavourite?: boolean,
  canSetIsExecutive?: boolean
}>(), {
  isVisible: true,
  isFlagged: false,
  isFavourite: false,
  canSetIsExecutive: true
});

const annotationSubject = computed(() =>
  subject('Annotation', {
    observation: {
      location: {
        country: {
          id: props.observation.location.country?.id
        }
      }
    }
  })
)

watch(
  selectedSex,
  (newSex) => {
    if (!form.value) return
    if (newSex !== SpeciesCharacteristicsSex.Female) {
      form.value.setFieldValue('bloodFed', false)
      form.value.setFieldValue('isGravid', false)
    }
  }
)

const emit = defineEmits<{
  (e: 'submit', shouldContinue: boolean): void
}>();

const isExtended = computed(() => {
  return props.annotationType === AnnotationType.Long;
});

const isFemale = computed(() => {
  return selectedSex.value === SpeciesCharacteristicsSex.Female;
})

const isInternalNoteRequired = computed(() =>
  !props.isVisible || props.isFlagged
)

// Watch for isFlagged changes
watch(() => props.isFlagged, (newVal) => {
  if (newVal) {
    isExecutive.value = false;
  }
});

const handleKeyDownTags = (event: KeyboardEvent) => {
  switch (event.code) {
    case 'Comma':
    case 'Space':
      event.preventDefault(); // prevent the character from being typed
      tagInputFieldRef.value?.onEnterKey(event);
      break;
  }
};

const resolver = ({ values }: { values: Record<string, any> }) => {
  const errors: Record<string, { message: string }[]> = {};

  if (!publicNote.value) {
    errors.publicNote = [{ message: 'Public note is required.' }];
  }

  if (isInternalNoteRequired.value && !values.internalNote) {
    errors.internalNote = [{ message: 'Internal note is required.' }];
  }

  if (selectedSex.value === undefined) {
    errors.sex = [{ message: 'Sex is required.' }];
  }

  return {
    values, // (Optional) Used to pass current form values to submit event.
    errors
  };
};

const onFormSubmit = ({ valid, values }: { valid: boolean, values: Record<string, any> }) => {
  if (valid) {
    isSubmitting.value = true;
    const annotationRequest = <AnnotationRequest>{
      best_photo_uuid: props.bestPhoto?.uuid,
      classification: <SpeciesClassificationRequest>{
        taxon_id: selectedTaxon.value!.id,
        confidence_label: values.isHighConfidence
          ? SpeciesClassificationConfidenceLabel.Definitely
          : SpeciesClassificationConfidenceLabel.Probably
      },
      feedback: {
        public_note: isExtended.value ? publicNote.value : null,
        internal_note: values.internalNote
      } as AnnotationFeedbackRequest,
      characteristics: isExtended.value ? <SpeciesCharacteristicsRequest>{
        sex: selectedSex.value,
        blood_fed: values.bloodFed || false,
        is_gravid: values.isGravid || false
      } : undefined,
      is_flagged: props.isFlagged,
      is_decisive: isExecutive.value,
      observation_flags: {
        is_favourite: props.isFavourite,
        is_visible: props.isVisible
      },
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

const generatePublicNote = () => {
  if (selectedTaxon.value) {
    publicNote.value = getPublicNote(selectedTaxon.value, isHighConfidence.value, props.observation.user.locale || 'en');
  }
};

</script>
