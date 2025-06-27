<template>
  <div class="card">
    <div class="flex flex-row">
      <h4 class="m-0!">Identification tasks</h4>
      <AnnotationStartButton class="ml-auto" />
    </div>
    <DataView :value="identificationTasksArray" dataKey='observation.uuid' v-model:rows="numRows"
      :total-records="identificationTasksTotalCount" :layout="layout" lazy paginator
      :rowsPerPageOptions="[5, 10, 25, 50]" @page="onPageChange"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="({totalRecords} items)">
      <template #header>
        <Toolbar class="mb-6 gap-2">
          <template #start>
            <div class="flex gap-2">
              <ToggleButton v-model="showFilters" onLabel="Filters" offLabel="Filters" onIcon="pi pi-filter-fill"
                offIcon="pi pi-filter" />
              <Select v-model="selectedOrderBy" :options="orderByArray" optionLabel="label" variant="filled"
                dropdown-icon="pi pi-sort-alt" />
            </div>
          </template>
          <template #end>
            <div class="flex gap-2">
              <div class="flex gap-1">
                <Button icon="pi pi-refresh" :loading="loading" @click="fetchData" />
                <!-- <Button label="Export" icon="pi pi-upload" severity="secondary" @click="handleExport" /> -->
              </div>
              <SelectButton v-model="layout" :options="layoutOptions" :allowEmpty="false">
                <template #option="{ option }">
                  <i :class="[option === 'list' ? 'pi pi-list' : 'pi pi-table']" />
                </template>
              </SelectButton>
            </div>
          </template>
        </Toolbar>
        <Panel v-show="showFilters" header="Filters" class="mt-4">
          <div class="flex gap-2">
            <FloatLabel variant="on">
              <IdentificationTaskStatusMultiSelect id="status_filter" v-model="selectedIdentificationTaskStatus" />
              <label for="status_filter">Status</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <TaxonTreeSelect id="taxaFilter" v-model="selectedTaxon" />
              <label for="taxaFilter">Taxa</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <IdentificationTaskSourceMultiSelect v-model="selectedSources" />
              <label>Source</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <CountryMultipleSelect id="countryFilter" v-model="selectedCountries"
                :allowedCountryIds="allowedCountryIds" />
              <label for="countryFilter">Countries</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <Select id="num_annotations" v-model="selectedNumAnnotation" class="w-35" :options="numAnnotationOptions"
                optionValue="value" optionLabel="label" dataKey="value" dropdown-icon="pi pi-plus-circle" showClear />
              <label for="num_annotations">Annotations</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <Select id="is_flagged" v-model="isFlagged" :options="[true, false]" showClear />
              <label for="is_flagged">Flag</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <DatePicker id="created_at_filter" v-model="selectedCreatedAtDateRange" showIcon iconDisplay="input"
                :max-date="new Date()" selectionMode="range" :manualInput="false" showButtonBar />
              <label for="created_at_filter">Created at</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <DatePicker id="updated_at_filter" v-model="selectedUpdatedAtDateRange" showIcon iconDisplay="input"
                :max-date="new Date()" selectionMode="range" :manualInput="false" showButtonBar />
              <label for="updated_at_filter">Updated at</label>
            </FloatLabel>
            <Button icon="pi pi-filter-slash" label="Clear" @click="clearFilters" />
          </div>
        </Panel>
      </template>
      <template #list="slotProps">
        <IdentificationTaskList ref='taskListRef' :tasks="slotProps.items" :loading="loading" />
      </template>
      <template #grid="slotProps">
        <IdentificationTaskGrid :tasks="slotProps.items" />
      </template>

    </DataView>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import type { DataViewPageEvent } from 'primevue/dataview'

import AnnotationStartButton from '@/components/annotations/AnnotationStartButton.vue';
import IdentificationTaskSourceMultiSelect from '@/components/identificationTasks/IdentificationTaskSourceMultiSelect.vue';
import IdentificationTaskStatusMultiSelect from '@/components/identificationTasks/IdentificationTaskStatusMultiSelect.vue';
import IdentificationTaskList from '@/components/identificationTasks/IdentificationTaskList.vue';
import IdentificationTaskGrid from '@/components/identificationTasks/IdentificationTaskGrid.vue';
import CountryMultipleSelect from '@/components/countries/CountryMultipleSelect.vue';
import TaxonTreeSelect from '@/components/taxa/TaxonTreeSelect.vue';

import { identificationTasksApi } from '@/services/apiService';

import type { IdentificationTask, IdentificationTaskResultSource, Country, Taxon } from 'mosquito-alert';
import { IdentificationTaskStatus } from 'mosquito-alert';
import { IdentificationtasksListOrderByParameter } from 'mosquito-alert';
import type { IdentificationTasksApiListRequest } from 'mosquito-alert';

import { useAbility } from '@casl/vue';
import type { AppAbility } from '@/services/ability';

const ability = useAbility<AppAbility>();

// Get allowed country IDs from CASL
const allowedCountryIds = computed<number[] | undefined>(() => {
  const rules = ability.rulesFor('view', 'IdentificationTask');

  // If any rule has no conditions at all => full access
  if (rules.some(rule => !rule.conditions)) {
    return undefined;
  }

  // Extract only rules that specifically filter by observation.location.country.id
  const ids = rules
    .map(rule => rule.conditions?.['observation.location.country.id'])
    .filter((id): id is number => typeof id === 'number');

  // If rules exist but none specify country.id, treat as unrestricted
  if (rules.length && ids.length === 0) {
    return undefined;
  }

  return [...new Set(ids)];
});

const route = useRoute()
const router = useRouter()

const taskListRef = ref();

const layout = ref<'grid' | 'list'>('list');
const layoutOptions = ref(['list', 'grid']);

const pageSelected = ref<number>(0);

const loading = ref<boolean>(false);
const showFilters = ref<boolean>(false);

// Filters
const selectedIdentificationTaskStatus = ref<IdentificationTaskStatus[]>([])
const selectedTaxon = ref<Taxon | null>(null);
const selectedSources = ref<IdentificationTaskResultSource[]>();
const selectedCountries = ref<Country[]>();
const selectedCountryIds = computed<number[]>(() => {
  return selectedCountries.value?.map(c => c.id) ?? [];
});
const selectedNumAnnotation = ref<{ min: number | undefined; max: number | undefined }>();
const numAnnotationOptions = ref<Array<{ value: { min: number | undefined; max: number | undefined }; label: string }>>([
  { value: { min: 0, max: 0 }, label: '0' },
  { value: { min: 1, max: 1 }, label: '1' },
  { value: { min: 2, max: 2 }, label: '2' },
  { value: { min: 3, max: 3 }, label: '3' },
  { value: { min: 3, max: undefined }, label: '+3' },
]);
const isFlagged = ref<boolean>();
const selectedCreatedAtDateRange = ref<Date[]>();
const selectedUpdatedAtDateRange = ref<Date[]>();

function clearFilters() {
  selectedIdentificationTaskStatus.value = [];
  selectedTaxon.value = null;
  selectedSources.value = [];
  selectedCountries.value = [];
  selectedNumAnnotation.value = undefined;
  isFlagged.value = undefined;
}

// Order by
const selectedOrderBy = ref<{ value: IdentificationtasksListOrderByParameter; label: string }>({ value: IdentificationtasksListOrderByParameter.MinusCreatedAt, label: 'Last created' })
const orderByArray = ref<Array<{ value: IdentificationtasksListOrderByParameter; label: string }>>([
  { value: IdentificationtasksListOrderByParameter.MinusCreatedAt, label: 'Last created' },
  { value: IdentificationtasksListOrderByParameter.MinusUpdatedAt, label: 'Last updated' },
  { value: IdentificationtasksListOrderByParameter.CreatedAt, label: 'First created' },
  { value: IdentificationtasksListOrderByParameter.UpdatedAt, label: 'First updated' },
]);

const onPageChange = (event: DataViewPageEvent) => {
  pageSelected.value = event.page
}

const identificationTasksTotalCount = ref<number>(0);
const identificationTasksArray = ref<IdentificationTask[]>([]);

const listRequest = ref<IdentificationTasksApiListRequest>();

const numRows = ref<number>(25);

onMounted(() => {
  // Initialize filters from route query params
  const q = route.query

  if (q.updatedAtAfter && q.updatedAtBefore) {
    selectedUpdatedAtDateRange.value = [
      new Date(q.updatedAtAfter as string),
      new Date(q.updatedAtBefore as string),
    ] as Date[];
  }

  if (q.createdAtAfter && q.createdAtBefore) {
    selectedCreatedAtDateRange.value = [
      new Date(q.updatedAtAfter as string),
      new Date(q.updatedAtBefore as string),
    ] as Date[];
  }

  isFlagged.value = q.isFlagged ? Boolean(JSON.parse(q.isFlagged as string)) : undefined;

  pageSelected.value = q.page ? Number(q.page) - 1 : 0
  numRows.value = q.pageSize ? Number(q.pageSize) : 25
})

const fetchData = () => {
  loading.value = true;
  identificationTasksApi.list(listRequest.value).then(
    (response) => {
      // Assign results to identificationTasksArray.value, or an empty array if results is undefined
      identificationTasksArray.value = response.data.results || [];
      identificationTasksTotalCount.value = response.data.count || 0;

      loading.value = false;
    }
  ).catch((error) => {
    console.error(error);
    loading.value = false;  // Ensure loading is set to false even if there is an error
  });
}

watch(listRequest, async () => {
  fetchData();
})

watchEffect(async () => {
  listRequest.value = {
    createdAtAfter: selectedCreatedAtDateRange.value && selectedCreatedAtDateRange.value.length > 1 ? selectedCreatedAtDateRange.value[0].toISOString() : undefined,
    createdAtBefore: selectedCreatedAtDateRange.value && selectedCreatedAtDateRange.value.length > 1 ? new Date(new Date(selectedCreatedAtDateRange.value[1]).setDate(selectedCreatedAtDateRange.value[1].getDate() + 1)).toISOString() : undefined,
    updatedAtAfter: selectedUpdatedAtDateRange.value && selectedUpdatedAtDateRange.value.length > 1 ? selectedUpdatedAtDateRange.value[0].toISOString() : undefined,
    updatedAtBefore: selectedUpdatedAtDateRange.value && selectedUpdatedAtDateRange.value.length > 1 ? new Date(new Date(selectedUpdatedAtDateRange.value[1]).setDate(selectedUpdatedAtDateRange.value[1].getDate() + 1)).toISOString() : undefined,
    status: selectedIdentificationTaskStatus.value || undefined,
    isFlagged: isFlagged.value ?? undefined,
    numAnnotationsMin: selectedNumAnnotation.value?.min,
    numAnnotationsMax: selectedNumAnnotation.value?.max,
    observationCountryIds: selectedCountryIds.value || undefined,
    resultSource: selectedSources.value || undefined,
    resultTaxonIds: selectedTaxon.value ? [selectedTaxon.value.id] : undefined,
    page: pageSelected.value + 1,
    pageSize: numRows.value,
    orderBy: selectedOrderBy.value ? [selectedOrderBy.value.value] : undefined
  } as IdentificationTasksApiListRequest

  const query = Object.fromEntries(
    Object.entries(listRequest.value)
      .filter(([_, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => Array.isArray(v) ? [k, v.join(',')] : [k, v])
  )

  router.replace({ query })
})

</script>
