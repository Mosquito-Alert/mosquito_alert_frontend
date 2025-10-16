<template>
  <ul class="list-none p-0 m-0">
    <li class="flex items-center py-4 px-2 border-surface flex-wrap">
      <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">UUID</div>
      <div class="text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">
        {{ observation.uuid }}
      </div>
    </li>
    <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
      <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">Short ID</div>
      <div class="text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">
        {{ observation.short_id }}
      </div>
    </li>
    <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
      <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">Created at
      </div>
      <div class="text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">{{
        dayjs.utc(
          observation.created_at
        ).tz(
          observation.location.timezone!
        ).format('YYYY-MM-DD HH:mm:ss')
      }}</div>
    </li>
    <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
      <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">Location</div>
      <div class="text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">
        {{ observation.location.display_name }}
      </div>
    </li>
    <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
      <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">GPS</div>
      <div class="text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">
        {{ observation.location.point.longitude.toFixed(4) }},
        {{ observation.location.point.latitude.toFixed(4) }}
      </div>
    </li>

    <li class="flex items-center py-4 px-2 border-t border-surface flex-wrap">
      <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">Note</div>
      <div class="text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">{{
        observation.note }}</div>
    </li>
  </ul>
  <Divider />
  <LocationMap height="300px" :location="observation.location">
    <PhotoGpsLeafletLayer :photos="observation.photos" />
    <l-control-layers :hide-single-base="true" position="bottomleft" />
  </LocationMap>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

import { LControlLayers } from "@vue-leaflet/vue-leaflet";
import type { Observation, AssignedObservation, SimplifiedObservationWithPhotos } from 'mosquito-alert';

import LocationMap from '../locations/LocationMap.vue';
import PhotoGpsLeafletLayer from '../photos/PhotoGpsLeafletLayer.vue';

defineProps<{
  observation: Observation | AssignedObservation | SimplifiedObservationWithPhotos
}>();

</script>
