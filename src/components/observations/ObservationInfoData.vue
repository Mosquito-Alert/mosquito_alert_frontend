<template>
  <ul class="list-none p-0 m-0">
    <li class="flex items-center py-4 px-2 border-surface flex-wrap">
      <div class="text-surface-500 dark:text-surface-300 w-6/12 md:w-2/12 font-medium">UUID</div>
      <div class="text-surface-900 dark:text-surface-0 w-full md:w-10/12 md:order-none order-1">
        {{ observation.uuid }}
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
        ).format('YYYY-MM-DD hh:mm:ss')
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
  <LocationMap height="300px" :location="observation.location" />
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

import LocationMap from '../locations/LocationMap.vue';

import type { Observation, SimplifiedObservationWithPhotos } from 'mosquito-alert';


defineProps<{
  observation: Observation | SimplifiedObservationWithPhotos
}>();

</script>
