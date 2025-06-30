<template>
  <Tag :severity="identificationTask.review ? 'info' : 'warn'"
    :value="identificationTask.review ? formatLocalDateTime(identificationTask.review.created_at) : 'Not reviewed'"
    v-tooltip.bottom="identificationTask.review ? 'Review datetime' : undefined">
    <template #icon>
      <span class="material-symbols-outlined p-tag-icon">
        {{ identificationTask.review ? 'verified' : 'verified_off' }}
      </span>
    </template>
  </Tag>
</template>

<script setup lang="ts">
import type { IdentificationTask } from 'mosquito-alert';

import { formatLocalDateTime } from '@/utils/DateUtils';

defineProps<{
  identificationTask: IdentificationTask
}>()

</script>
