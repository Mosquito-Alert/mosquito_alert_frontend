<template>
  <Message :severity="review.action == IdentificationTaskReviewAction.Agree ? 'success' : 'warn'">
    <template #icon>
      <span class="material-symbols-outlined p-message-icon">
        rate_review
      </span>
    </template>
    <span>
      The reviewer has <strong>
        {{ review.action == IdentificationTaskReviewAction.Agree ? 'agreed' : 'disagreed' }}
      </strong>
      with the result from the annotators.
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
