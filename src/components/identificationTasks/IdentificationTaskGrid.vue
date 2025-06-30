<template>
  <div class="items-center justify-center grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    <div v-for="(item, key) in tasks" :key="key" class="relative w-full h-full overflow-hidden group">
      <IdentificationTaskGridItem :task="item" @on-review-success="$emit('onChange')" />
    </div>
  </div>
</template>


<script setup lang="ts">

import type { IdentificationTask } from 'mosquito-alert';

import IdentificationTaskGridItem from './IdentificationTaskGridItem.vue';

defineProps<{
  tasks: IdentificationTask[]
}>()

defineEmits<{
  (e: 'onChange'): void,
}>()

</script>
