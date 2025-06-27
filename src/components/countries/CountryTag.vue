<template>
  <div class="flex items-center gap-2">
    <i :class="`flag flag-${country.iso3_code.toLowerCase()} rounded`" style="width: 24px" />
    <span>{{ country.name_en }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Country } from 'mosquito-alert';

defineProps<{
  country: Country
}>();


</script>
