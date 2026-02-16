<template>
  <Tag :severity="classification?.taxon && classification.is_high_confidence ? 'success' : 'secondary'"
    class="bg-transparent! border border-gray-500 relative">
    <div class="flex items-center gap-2 px-1">
      <i v-if="classification?.taxon && classification.is_high_confidence" class="pi pi-angle-double-up"
        v-tooltip.bottom="'High confidence'" />
      <span class="text-base text-surface-900 dark:text-surface-0">
        {{ classification?.taxon?.name || 'Off-topic' }}
        <i v-if="sex" :class="sex === SpeciesCharacteristicsSex.Male ? 'pi pi-mars' : 'pi pi-venus'"
          style="font-size: 0.8rem" />
      </span>
    </div>
    <slot></slot>
  </Tag>

</template>

<script setup lang="ts">

import type { IdentificationTaskResult, SpeciesClassification } from 'mosquito-alert';
import { SpeciesCharacteristicsSex } from 'mosquito-alert';

defineProps<{
  classification: IdentificationTaskResult | SpeciesClassification | null,
  sex?: SpeciesCharacteristicsSex
}>()

</script>
