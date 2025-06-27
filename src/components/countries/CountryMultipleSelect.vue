<template>
  <MultiSelect v-model="selectedCountries" :options="sortedCountries" optionLabel="name_en" :loading="loading"
    display="chip" dropdown-icon="pi pi-plus-circle" filter showClear resetFilterOnClear :maxSelectedLabels="3">
    <template #option="slotProps">
      <CountryTag :country="slotProps.option" />
    </template>
  </MultiSelect>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import { useCountryStore } from '@/stores/countryStore';
import CountryTag from './CountryTag.vue';

import type { Country } from 'mosquito-alert';

const selectedCountries = defineModel<Country[]>();

const props = defineProps<{
  allowedCountryIds?: number[];
}>();

const loading = ref<boolean>(false);

const countries = ref<Country[]>();
const sortedCountries = computed<Country[]>(() => {
  if (!countries.value) return [];

  let filtered = countries.value;

  if (props.allowedCountryIds?.length) {
    filtered = filtered.filter(country => props.allowedCountryIds?.includes(country.id));
  }

  return [...filtered].sort((a, b) => a.name_en.localeCompare(b.name_en));
})

const countryStore = useCountryStore();

onMounted(async () => {
  await fetchCountries();
})

async function fetchCountries() {
  if (countryStore.countries.length === 0) {
    loading.value = true
    await countryStore.fetchCountries();
    loading.value = false
  }
  countries.value = countryStore.countries as Country[];
}
</script>
