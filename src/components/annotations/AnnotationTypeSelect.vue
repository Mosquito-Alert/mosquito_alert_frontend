<template>
  <Select :model-value="modelValue" :options="options" optionValue="value" showClear @update:modelValue="onUpdate">
    <template #value="slotProps">
      <AnnotationTypeTag v-if="slotProps.value" :type="slotProps.value" />
      <span v-else-if="slotProps.placeholder">
        {{ slotProps.placeholder }}
      </span>
    </template>
    <template #option="slotProps">
      <AnnotationTypeTag :type="slotProps.option.value" />
    </template>
  </Select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AnnotationType } from 'mosquito-alert';

import AnnotationTypeTag from './AnnotationTypeTag.vue';

defineProps<{
  modelValue?: AnnotationType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: AnnotationType | undefined): void;
}>();

const onUpdate = (value: AnnotationType | undefined) => {
  emit('update:modelValue', value ?? undefined);
};

const options = computed<{ value: AnnotationType }[]>(() => {
  return Object.values(AnnotationType)
    .filter(type => type !== AnnotationType.UnknownDefaultOpenApi)
    .map(type => ({
      value: type
    }));
})
</script>
