<template>
  <MultiSelect v-model="selectedIdentificationTaskResultSource" display="chip" :options="options" optionValue="value"
    optionLabel="label" data-key="value" :maxSelectedLabels="3" dropdown-icon="pi pi-plus-circle" :showToggleAll="false"
    showClear resetFilterOnClear>
    <template #option="slotProps">
      <div class="flex items-center gap-2">
        <i :class="slotProps.option.icon"></i>
        <span>{{ slotProps.option.label }}</span>
      </div>
    </template>
  </MultiSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IdentificationTaskResultSource } from 'mosquito-alert';

const selectedIdentificationTaskResultSource = defineModel<IdentificationTaskResultSource[]>();

const options = ref<Array<{ value: IdentificationTaskResultSource; label: string; icon: string }>>([
  { value: IdentificationTaskResultSource.Expert, label: 'Expert community', icon: 'pi pi-users' },
  { value: IdentificationTaskResultSource.Ai, label: 'Artificial Intelligence', icon: 'pi pi-microchip-ai' },
]);

</script>
