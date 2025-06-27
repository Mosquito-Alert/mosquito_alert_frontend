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
            <IdentificationTaskStatusTag v-if="item.status" :status="item.status" />
          </figcaption>
          <figcaption v-if="item.observation.location.country"
            class="absolute top-2 right-2 rounded-md gap-1 flex flex-col">
            <CountryTag v-if="item.observation.location.country" :country="item.observation.location.country"
              class="text-white bg-black/50 rounded-md p-2" />
            <div class="gap-1 flex justify-end">
              <Tag v-if="item.is_flagged" icon="pi pi-flag" severity="danger" />
              <Tag v-if="item.is_safe" icon="pi pi-shield" severity="success" />
            </div>
          </figcaption>
          <figcaption class="absolute top-2 right-2 text-white p-2 rounded-md">

          </figcaption>
          <figcaption v-if="item.result.source" class="absolute bottom-2 left-2">
            <IdentificationTaskResultTag class="bg-white/80!" :result="item.result" />
          </figcaption>
        </figure>
      </router-link>
    </div>
  </div>
</template>


<script setup lang="ts">

import type { IdentificationTask } from 'mosquito-alert';

import CountryTag from '@/components/countries/CountryTag.vue';
import IdentificationTaskStatusTag from '@/components/identificationTasks/IdentificationTaskStatusTag.vue';
import IdentificationTaskResultTag from '@/components/identificationTasks/IdentificationTaskResultTag.vue';

defineProps<{
  tasks: IdentificationTask[]
}>()

</script>
