<template>
  <MultiSelect id="status_filter" v-model="selectedIdentificationTaskStatus" display="chip" :options="options"
    optionValue="value" optionLabel="label" data-key="value" :maxSelectedLabels="3" dropdown-icon="pi pi-plus-circle"
    filter showClear resetFilterOnClear>
    <template #option="slotProps">
      <div class="flex items-center">
        <IdentificationTaskStatusTag :status="slotProps.option.value" />
      </div>
    </template>
  </MultiSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IdentificationTaskStatus } from 'mosquito-alert';
import IdentificationTaskStatusTag from './IdentificationTaskStatusTag.vue';

const selectedIdentificationTaskStatus = defineModel<IdentificationTaskStatus[]>();

const options = ref<Array<{ value: IdentificationTaskStatus; label: string }>>([
  { value: IdentificationTaskStatus.Open, label: 'Open' },
  { value: IdentificationTaskStatus.Conflict, label: 'Conflict' },
  { value: IdentificationTaskStatus.Review, label: 'Review' },
  { value: IdentificationTaskStatus.Done, label: 'Done' },
  { value: IdentificationTaskStatus.Archived, label: 'Archived' },
]);

</script>
