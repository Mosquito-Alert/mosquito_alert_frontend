<template>
  <Select id="isSafe_select" :model-value="{ 'isSafe': isSafe }" @update:model-value="val => isSafe = val.isSafe"
    :options="options" optionLabel="isSafe">
    <template #value="slotProps">
      <IdentificationTaskIsSafeTag :is-safe="slotProps.value.isSafe" />
    </template>
    <template #option="slotProps">
      <IdentificationTaskIsSafeTag :is-safe="slotProps.option.isSafe" />
    </template>
  </Select>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import IdentificationTaskIsSafeTag from './IdentificationTaskIsSafeTag.vue';

const isSafe = defineModel<boolean>();

const options = ref<Array<{ isSafe: boolean }>>([
  { isSafe: true },
  { isSafe: false },
]);

</script>
