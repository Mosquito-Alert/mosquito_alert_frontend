<template>
  <MultiSelect v-model="selectedCountries" :options="sortedCountries" optionLabel="name_en" :loading="loading"
    display="chip" dropdown-icon="pi pi-plus-circle" filter showClear resetFilterOnClear :maxSelectedLabels="3">
    <template #option="slotProps">
      <div class="flex items-center gap-2">
        <i :class="`flag flag-${slotProps.option.iso3_code.toLowerCase()} rounded`" style="width: 24px" />
        <span>{{ slotProps.option.name_en }}</span>
      </div>
    </template>
  </MultiSelect>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import { useCountryStore } from '@/stores/countryStore';

import type { Country } from 'mosquito-alert';

const selectedCountries = defineModel<Country[]>();

const loading = ref<boolean>(false);

const countries = ref<Country[]>();
const sortedCountries = computed<Country[]>(() => {
  if (!countries.value) return [];
  return [...countries.value].sort((a, b) => a.name_en.localeCompare(b.name_en));
})

const countryStore = useCountryStore();

onMounted(async () => {
  await fetchCountries();
})

async function fetchCountries() {
  if (!countryStore.countries) {
    loading.value = true
    await countryStore.fetchCountries();
    loading.value = false
  }
  countries.value = countryStore.countries as Country[];
}
</script>
