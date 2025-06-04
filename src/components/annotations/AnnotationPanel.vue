<template>
  <Panel toggleable collapsed>
    <template #header>
      <div class="flex items-center gap-2">
        <Avatar icon="pi pi-user" shape="circle" :label="getInitials(annotation?.user.full_name || '')" />
        <span class="font-bold">{{ annotation?.user.full_name }}</span>
        <Tag v-if="annotation?.is_flagged" icon="pi pi-flag" severity="danger" value="Flagged" rounded />
        <Tag v-if="annotation?.is_decisive" severity="contrast" value="Executive" rounded
          v-tooltip.top="'This annotation determines the final identification task result.'">
          <template #icon>
            <!-- <i class="fa fa-gavel" /> -->
            <span class="material-symbols-outlined p-tag-icon">
              gavel
            </span>
          </template>
        </Tag>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-col items-center justify-between">
        <span class="ml-auto text-surface-500 dark:text-surface-400">
          {{ formatLocalDateTime(annotation.created_at) }}
        </span>
      </div>
    </template>
    <template #icons>
      <TaxonClassificationTag :classification="annotation.classification" />
    </template>
    <div class="flex mb-2">
      <div class="flex ml-auto gap-1">
        <Tag v-for="tag in annotation.tags" :key="tag" severity="secondary" :value="'#' + tag" />
      </div>
    </div>
    <ul class="list-none p-0 m-0">
      <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
        <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">Public note</div>
        <div class="text-surface-900 dark:text-surface-0 w-full md:w-8/12 md:order-none order-1">
          {{ annotation?.feedback?.public_note }}
        </div>
      </li>
      <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
        <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">Internal note
        </div>
        <div class="text-surface-900 dark:text-surface-0 w-full md:w-8/12 md:order-none order-1">{{
          annotation?.feedback?.internal_note }}</div>
      </li>
    </ul>
  </Panel>
</template>

<script setup lang="ts">

import type { Annotation } from 'mosquito-alert';
import TaxonClassificationTag from '../taxa/TaxonClassificationTag.vue';

import { getInitials } from '@/utils/Utils';
import { formatLocalDateTime } from '@/utils/DateUtils';

defineProps<{
  annotation: Annotation
}>()



</script>
