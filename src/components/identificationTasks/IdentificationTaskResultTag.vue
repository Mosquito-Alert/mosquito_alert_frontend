<template>
  <TaxonClassificationTag :classification="result || null">
    <div v-if="result.source"
      class="flex absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 origin-[100%_0%] m-0 outline-2 outline-solid outline-white text-surface-900 bg-white justify-items-center items-center p-1 rounded-full">
      <i v-if='result.source === IdentificationTaskResultSource.Ai' class="pi pi-microchip-ai"
        v-tooltip.right="'From artificial intelligence'" />
      <i v-if='result.source === IdentificationTaskResultSource.Expert' class="pi pi-users"
        v-tooltip.right="'From experts agreement'" />
    </div>
  </TaxonClassificationTag>
</template>

<script setup lang="ts">
import TaxonClassificationTag from '@/components/taxa/TaxonClassificationTag.vue';
import type { IdentificationTaskResult } from 'mosquito-alert';
import { IdentificationTaskResultSource } from 'mosquito-alert';

defineProps<{
  result: IdentificationTaskResult,
}>()

</script>
