<template>
  <Message :severity="review.action == IdentificationTaskReviewAction.Agree ? 'success' : 'warn'">
    <template #icon>
      <span class="material-symbols-outlined p-message-icon">
        rate_review
      </span>
    </template>
    <span v-if="review.action == IdentificationTaskReviewAction.Agree">
      The reviewer has <strong>agreed</strong> with the result.
    </span>
    <span v-else>
      The reviewer has <strong>forced</strong> the final result.
    </span>
  </Message>
</template>

<script setup lang="ts">
import type { IdentificationTaskReview } from 'mosquito-alert';
import { IdentificationTaskReviewAction } from 'mosquito-alert';

defineProps<{
  review: IdentificationTaskReview
}>()

</script>
