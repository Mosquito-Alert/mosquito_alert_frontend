<template>
  <div class="items-center justify-center grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
    <div v-for="(item, key) in tasks" :key="key" class="relative w-full h-full overflow-hidden group">
      <router-link :to="{ name: 'identification_task', params: { observationUuid: item.observation.uuid } }"
        class="relative">
        <figure>
          <Image :src="item.public_photo.url"
            image-class="aspect-square object-cover transition-all duration-300 cursor-pointer"
            class="w-full h-full group-hover:brightness-50" />
          <figcaption class="absolute top-2 left-2 text-white rounded-md gap-1">
            <Tag v-if="item.status" :value="item.status.toUpperCase()" :severity="getStatusSeverity(item.status)" />
          </figcaption>
          <figcaption v-if="item.observation.location.country"
            class="absolute top-2 right-2 rounded-md gap-1 flex flex-col">
            <div class="text-white bg-black/50 flex gap-1 p-2 rounded-md">
              <i :class="`flag flag-${item.observation.location.country?.iso3_code.toLowerCase()} rounded`"
                style="width: 24px" />
              <span>{{ item.observation.location.country?.name_en }}</span>
            </div>
            <div class="gap-1 flex justify-end">
              <Tag v-if="item.is_flagged" icon="pi pi-flag" severity="danger" />
              <Tag v-if="item.is_safe" icon="pi pi-shield" severity="success" />
            </div>
          </figcaption>
          <figcaption class="absolute top-2 right-2 text-white p-2 rounded-md">

          </figcaption>
          <figcaption v-if="item.result.source" class="absolute bottom-2 left-2">
            <TaxonClassificationTag class="bg-white/80!" :classification="item.result" />
          </figcaption>
        </figure>
      </router-link>
    </div>
  </div>
</template>


<script setup lang="ts">

import type { IdentificationTask } from 'mosquito-alert';
import { getStatusSeverity } from '@/utils/IdentificationTaskUtils';
import TaxonClassificationTag from './taxa/TaxonClassificationTag.vue';

defineProps<{
  tasks: IdentificationTask[]
}>()

</script>
