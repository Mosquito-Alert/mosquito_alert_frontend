<template>
  <Tag :severity="severity" :value="showLabel ? value : undefined" rounded>
    <template #icon>
      <i v-if="showIcon" :class="icon" />
    </template>
  </Tag>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { AnnotationType } from 'mosquito-alert';

const props = withDefaults(defineProps<{
  type: AnnotationType,
  showLabel?: boolean,
  showIcon?: boolean
}>(), {
  showLabel: true,
  icon: false
});

const icon = computed(() => {
  return props.type === AnnotationType.Long ? "pi pi-arrows-h" : ""
})

const value = computed(() => {
  return props.type === AnnotationType.Long ? "Extended" : "Basic";
});

const severity = computed(() => {
  return props.type === AnnotationType.Long ? "info" : "secondary";
});

</script>
