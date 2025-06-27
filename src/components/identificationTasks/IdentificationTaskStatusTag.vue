<template>
  <Tag :value="status.toUpperCase()" :severity="getStatusSeverity(status)" />
</template>

<script setup lang="ts">
import { IdentificationTaskStatus } from 'mosquito-alert';

defineProps<{
  status: IdentificationTaskStatus;
}>();

const getStatusSeverity = (status: IdentificationTaskStatus) => {
  switch (status) {
    case IdentificationTaskStatus.Open:
      return 'info'
    case IdentificationTaskStatus.Conflict:
      return 'danger'
    case IdentificationTaskStatus.Review:
      return 'warning'
    case IdentificationTaskStatus.Done:
      return 'success'
    case IdentificationTaskStatus.Archived:
      return 'secondary'
    default:
      return 'default' // optional fallback
  }
}

</script>
