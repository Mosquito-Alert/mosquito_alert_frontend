<template>
  <Tag :severity="review ? 'info' : 'warn'" :value="review ? formatLocalDateTime(review.created_at) : 'Not reviewed'"
    v-tooltip.bottom="review ? 'Review datetime' : undefined">
    <template #icon>
      <span class="material-symbols-outlined p-tag-icon">
        {{ review ? 'verified' : 'verified_off' }}
      </span>
    </template>
  </Tag>
</template>

<script setup lang="ts">
import type { IdentificationTaskReview } from 'mosquito-alert';

import { formatLocalDateTime } from '@/utils/DateUtils';

defineProps<{
  review: IdentificationTaskReview | null
}>()

</script>
