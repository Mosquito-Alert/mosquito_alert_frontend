<template>
  <div class="card">
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
            <Button label="Export" icon="pi pi-upload" severity="secondary" @click="handleExport" />
          </div>
          <SelectButton v-model="layout" :options="options" :allowEmpty="false">
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
          <MultiSelect id="status_filter" v-model="selectedIdentificationTaskStatus" display="chip"
            :options="identificationTaskStatusArray" optionValue="value" optionLabel="label" data-key="value"
            :maxSelectedLabels="3" dropdown-icon="pi pi-plus-circle" filter showClear resetFilterOnClear>
            <template #option="slotProps">
              <div class="flex items-center">
                <Tag :value="slotProps.option.label.toUpperCase()"
                  :severity="getStatusSeverity(slotProps.option.value)" />
              </div>
            </template>
            <!-- <template #footer>
                <Button label="Clear filter" severity="danger" text size="small" class="w-full" />
              </template> -->
          </MultiSelect>
          <label for="status_filter">Status</label>
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
        <FloatLabel variant="on">
          <Select id="is_flagged" v-model="isFlagged" :options="[true, false]" showClear />
          <label for="is_flagged">Flag</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <Select id="num_annotations" v-model="selectedNumAnnotation" :options="numAnnotationOptions"
            optionValue="value" optionLabel="label" dataKey="value" dropdown-icon="pi pi-plus-circle" showClear />
          <label for="num_annotations">Annotations</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <CountryMultipleSelect id="countryFilter" v-model="selectedCountries" />
          <label for="countryFilter">Countries</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <TaxonTreeSelect id="taxaFilter" />
          <label for="taxaFilter">Taxa</label>
        </FloatLabel>

        <Button icon="pi pi-filter-slash" label="Clear" />
      </div>
    </Panel>
    <DataView :value="identificationTasksArray" dataKey='observation.uuid' v-model:rows="numRows"
      :total-records="identificationTasksTotalCount" :layout="layout" lazy paginator
      :rowsPerPageOptions="[5, 10, 25, 50]" @page="onPageChange"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="({totalRecords} items)">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">Identification tasks</h4>
          <Button label="Start annotating" icon="pi pi-arrow-right" iconPos="right" />
        </div>
      </template>
      <template #list="slotProps">
        <IdentificationTaskList ref='taskList' :tasks="slotProps.items" :loading="loading" />
      </template>
      <template #grid="slotProps">
        <IdentificationTaskGrid :tasks="slotProps.items" />
      </template>

    </DataView>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect, computed } from 'vue'
import type { DataViewPageEvent } from 'primevue/dataview'

import IdentificationTaskList from '@/components/IdentificationTaskList.vue';
import IdentificationTaskGrid from '@/components/IdentificationTaskGrid.vue';
import CountryMultipleSelect from '@/components/CountryMultipleSelect.vue';
import TaxonTreeSelect from '@/components/taxa/TaxonTreeSelect.vue';
import { getStatusSeverity } from '@/utils/IdentificationTaskUtils';

import { identificationTasksApi } from '@/services/apiService';
import type { IdentificationTask, Country } from 'mosquito-alert';
import { IdentificationTaskStatus } from 'mosquito-alert';
import { IdentificationtasksListOrderByParameter } from 'mosquito-alert';
import type { IdentificationTasksApiListRequest } from 'mosquito-alert';

const taskList = ref();

const layout = ref<'grid' | 'list'>('list');
const options = ref(['list', 'grid']);

const pageSelected = ref<number>(0);

const loading = ref<boolean>(false);
const showFilters = ref<boolean>(false);

const selectedCountries = ref<Country[]>();
const selectedCountryIds = computed<number[]>(() => {
  return selectedCountries.value?.map(c => c.id) ?? [];
});

const selectedCreatedAtDateRange = ref<Date[]>();
const selectedUpdatedAtDateRange = ref<Date[]>();
const isFlagged = ref<boolean>(false);

const onPageChange = (event: DataViewPageEvent) => {
  pageSelected.value = event.page
}

const numAnnotationOptions = ref<Array<{ value: { min: number | undefined; max: number | undefined }; label: string }>>([
  { value: { min: 0, max: 0 }, label: '0' },
  { value: { min: 1, max: 1 }, label: '1' },
  { value: { min: 2, max: 2 }, label: '2' },
  { value: { min: 3, max: 3 }, label: '3' },
  { value: { min: 3, max: undefined }, label: '+3' },
]);
const selectedNumAnnotation = ref<{ min: number | undefined; max: number | undefined }>();

const selectedIdentificationTaskStatus = ref<Array<IdentificationTaskStatus>>([])
const identificationTaskStatusArray = ref<Array<{ value: IdentificationTaskStatus; label: string }>>([
  { value: IdentificationTaskStatus.Open, label: 'Open' },
  { value: IdentificationTaskStatus.Conflict, label: 'Conflict' },
  { value: IdentificationTaskStatus.Review, label: 'Review' },
  { value: IdentificationTaskStatus.Done, label: 'Done' },
  { value: IdentificationTaskStatus.Archived, label: 'Archived' },
]);

const selectedOrderBy = ref<{ value: IdentificationtasksListOrderByParameter; label: string }>({ value: IdentificationtasksListOrderByParameter.MinusCreatedAt, label: 'Last created' })
const orderByArray = ref<Array<{ value: IdentificationtasksListOrderByParameter; label: string }>>([
  { value: IdentificationtasksListOrderByParameter.MinusCreatedAt, label: 'Last created' },
  { value: IdentificationtasksListOrderByParameter.MinusUpdatedAt, label: 'Last updated' },
  { value: IdentificationtasksListOrderByParameter.CreatedAt, label: 'First created' },
  { value: IdentificationtasksListOrderByParameter.UpdatedAt, label: 'First updated' },
]);

const identificationTasksTotalCount = ref<number>(0);
const identificationTasksArray = ref<IdentificationTask[]>([]);

const listRequest = ref<IdentificationTasksApiListRequest>();

const numRows = ref<number>(25);


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
    page: pageSelected.value + 1,
    pageSize: numRows.value,
    orderBy: selectedOrderBy.value ? [selectedOrderBy.value.value] : undefined
  }
})

const handleExport = () => {
  taskList.value?.exportCSV();
}

</script>
