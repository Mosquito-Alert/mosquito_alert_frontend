<template>
  <Tag :value="getValue(reviewActionParam)" :severity="getStatusSeverity(reviewActionParam)" />
</template>
<script setup lang="ts">
import { IdentificationtasksListReviewActionParameter } from 'mosquito-alert';

defineProps<{
  reviewActionParam: IdentificationtasksListReviewActionParameter,
}>();

const getValue = (reviewAction: IdentificationtasksListReviewActionParameter) => {
  switch (reviewAction) {
    case IdentificationtasksListReviewActionParameter.Agree:
      return 'Agree'
    case IdentificationtasksListReviewActionParameter.Overwrite:
      return 'Disagree'
    case IdentificationtasksListReviewActionParameter.Null:
      return 'Not reviewed'
    default:
      return 'default' // optional fallback
  }
}

const getStatusSeverity = (reviewAction: IdentificationtasksListReviewActionParameter) => {
  switch (reviewAction) {
    case IdentificationtasksListReviewActionParameter.Agree:
      return 'success'
    case IdentificationtasksListReviewActionParameter.Overwrite:
      return 'warn'
    case IdentificationtasksListReviewActionParameter.Null:
      return 'secondary'
    default:
      return 'default' // optional fallback
  }
}

</script>
