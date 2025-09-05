<template>
  <Select id="review_action" v-model="reviewAction" :options="options" show-clear>
    <template #value="slotProps">
      <IdentificationTaskReviewActionTag v-if="slotProps.value" :reviewActionParam="slotProps.value" />
    </template>
    <template #option="slotProps">
      <IdentificationTaskReviewActionTag :reviewActionParam="slotProps.option" />
    </template>
  </Select>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { IdentificationtasksListReviewActionParameter } from 'mosquito-alert';
import IdentificationTaskReviewActionTag from './IdentificationTaskReviewActionTag.vue';

const reviewAction = defineModel<IdentificationtasksListReviewActionParameter>();

const options = ref<Array<IdentificationtasksListReviewActionParameter>>([
  IdentificationtasksListReviewActionParameter.Agree,
  IdentificationtasksListReviewActionParameter.Overwrite,
  IdentificationtasksListReviewActionParameter.Null,
]);

</script>
