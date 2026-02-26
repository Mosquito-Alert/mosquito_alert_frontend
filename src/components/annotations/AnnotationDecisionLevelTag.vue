<template>
  <Tag :severity="severity" :value="value" rounded v-tooltip.top="showTooltip ? tooltip : null">
    <template #icon>
      <span v-if="icon" class="material-symbols-outlined p-tag-icon">
        {{ icon }}
      </span>
    </template>
  </Tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AnnotationDecisionLevel } from 'mosquito-alert';

const props = withDefaults(defineProps<{
  decision_level: AnnotationDecisionLevel,
  showTooltip?: boolean
}>(), {
  showTooltip: true
});

const icon = computed(() => {
  switch (props.decision_level) {
    case AnnotationDecisionLevel.Executive:
      return "step_over";
    case AnnotationDecisionLevel.Final:
      return "gavel";
    default:
      return null;
  }
});

const value = computed(() => {
  return props.decision_level;
});

const tooltip = computed(() => {
  switch (props.decision_level) {
    case AnnotationDecisionLevel.Executive:
      return "Executive annotation";
    case AnnotationDecisionLevel.Final:
      return "This annotation determines the final result of the identification task";
    default:
      return null;
  }
});

const severity = computed(() => {
  switch (props.decision_level) {
    case AnnotationDecisionLevel.Executive:
      return "contrast";
    case AnnotationDecisionLevel.Final:
      return "contrast";
    default:
      return "secondary";
  }
});

</script>
