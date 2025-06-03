<template>
  <div class="card">
    <div class="flex flex-row">
      <h4 class="m-0!">Your annotations</h4>
      <Button class="ml-auto" label="Start annotating" icon="pi pi-arrow-right" iconPos="right"
        @click="onStartAnnotationClicked" />
    </div>
    <DataView :value="annotationsArray" dataKey='id' :rows="numRows" :total-records="annotationsTotalCount" lazy
      paginator :rowsPerPageOptions="[5, 10, 25, 50]" @page="onPageChange"
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
                <Button icon="pi pi-refresh" :loading="loading" severity="secondary" @click="fetchData" />
              </div>
            </div>
          </template>
        </Toolbar>
        <Panel v-show="showFilters" header="Filters" class="mt-4">
          <div class="flex gap-2">
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
              <Select id="is_flagged" v-model="isFlagged" class="w-28" :options="[true, false]" showClear />
              <label for="is_flagged">Flag</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <Select id="is_decisive" v-model="isDecisive" class="w-28" :options="[true, false]" showClear />
              <label for="is_decisive">Decisive</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <Select id="is_favourite" v-model="isFavourite" class="w-28" :options="[true, false]" showClear />
              <label for="is_favourite">Favourite</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <TaxonTreeSelect id="taxaFilter" v-model="selectedTaxon" />
              <label for="taxaFilter">Taxa</label>
            </FloatLabel>

            <Button icon="pi pi-filter-slash" label="Clear" @click="clearFilters" />
          </div>
        </Panel>
      </template>
      <template #list="slotProps">
        <AnnotationDataTable ref='annotationsList' :annotations="slotProps.items" :loading="loading" />
      </template>
    </DataView>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { DataViewPageEvent } from 'primevue/dataview'
import { useToast } from "primevue/usetoast";

import { IdentificationtasksListOrderByParameter } from 'mosquito-alert';
import type { Annotation, IdentificationTasksApiAnnotationsListMineRequest, Taxon } from 'mosquito-alert';

import AnnotationDataTable from '@/components/annotations/AnnotationDataTable.vue';
import TaxonTreeSelect from '@/components/taxa/TaxonTreeSelect.vue';
import { identificationTasksApi } from '@/services/apiService';
import { useAssignmentStore } from '@/stores/assignmentStore';

const route = useRoute()
const router = useRouter()

const toast = useToast();

const assignmentStore = useAssignmentStore();


const annotationsList = ref();

const pageSelected = ref<number>(0);

const loading = ref<boolean>(false);
const showFilters = ref<boolean>(false);

// Filters
const selectedCreatedAtDateRange = ref<Date[]>();
const selectedUpdatedAtDateRange = ref<Date[]>();
const isDecisive = ref<boolean>();
const isFlagged = ref<boolean>();
const isFavourite = ref<boolean>();
const selectedTaxon = ref<Taxon | null>(null);

const numRows = ref<number>(25);
const onPageChange = (event: DataViewPageEvent) => {
  pageSelected.value = event.page
}


const selectedOrderBy = ref<{
  value: IdentificationtasksListOrderByParameter,
  label: string
}>({
  value: IdentificationtasksListOrderByParameter.MinusCreatedAt,
  label: 'Last created'
})
const orderByArray = ref<Array<{ value: IdentificationtasksListOrderByParameter; label: string }>>([
  { value: IdentificationtasksListOrderByParameter.MinusCreatedAt, label: 'Last created' },
  { value: IdentificationtasksListOrderByParameter.MinusUpdatedAt, label: 'Last updated' },
  { value: IdentificationtasksListOrderByParameter.CreatedAt, label: 'First created' },
  { value: IdentificationtasksListOrderByParameter.UpdatedAt, label: 'First updated' },
]);

const annotationsTotalCount = ref<number>(0);
const annotationsArray = ref<Annotation[]>([]);

const listRequest = ref<IdentificationTasksApiAnnotationsListMineRequest>();

function clearFilters() {
  selectedCreatedAtDateRange.value = undefined;
  selectedUpdatedAtDateRange.value = undefined;
  isDecisive.value = undefined;
  isFlagged.value = undefined;
  isFavourite.value = undefined;
  selectedTaxon.value = null;
}

onMounted(() => {
  // Initialize filters from route query params
  const q = route.query

  if (q.createdAtAfter && q.createdAtBefore) {
    selectedCreatedAtDateRange.value = [
      new Date(q.createdAtAfter as string),
      new Date(q.createdAtBefore as string),
    ] as Date[];
  }

  if (q.updatedAtAfter && q.updatedAtBefore) {
    selectedUpdatedAtDateRange.value = [
      new Date(q.updatedAtAfter as string),
      new Date(q.updatedAtBefore as string),
    ] as Date[];
  }

  isDecisive.value = q.isDecisive ? Boolean(JSON.parse(q.isDecisive as string)) : undefined;
  isFlagged.value = q.isFlagged ? Boolean(JSON.parse(q.isFlagged as string)) : undefined;
  isFavourite.value = q.isFavourite ? Boolean(JSON.parse(q.isFavourite as string)) : undefined;

  pageSelected.value = q.page ? Number(q.page) - 1 : 0
  numRows.value = q.pageSize ? Number(q.pageSize) : 25

  // selectedOrderBy.value = q.orderBy ? { value: (q.orderBy as string).split(',')[0] } : null
})

const fetchData = () => {
  loading.value = true;
  identificationTasksApi.annotationsListMine(listRequest.value).then(
    (response) => {
      // Assign results to annotationsArray.value, or an empty array if results is undefined
      annotationsArray.value = response.data.results || [];
      annotationsTotalCount.value = response.data.count || 0;

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
    isDecisive: isDecisive.value ?? undefined,
    isFlagged: isFlagged.value ?? undefined,
    isFavourite: isFavourite.value ?? undefined,
    classificationTaxonIds: selectedTaxon.value?.id ? [selectedTaxon.value.id] : undefined,
    page: pageSelected.value + 1,
    pageSize: numRows.value,
    orderBy: selectedOrderBy.value ? [selectedOrderBy.value.value] : undefined
  } as IdentificationTasksApiAnnotationsListMineRequest

  const query = Object.fromEntries(
    Object.entries(listRequest.value)
      .filter(([_, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => Array.isArray(v) ? [k, v.join(',')] : [k, v])
  )

  router.replace({ query })
})

const onStartAnnotationClicked = async () => {
  // TODO: loading
  try {
    await assignmentStore.fetchNewAssignment();
  } catch (error) {
    toast.add(
      { severity: 'error', summary: 'Error', detail: error, life: 3000 }
    )
  }

  const assignment = assignmentStore.assignment
  if (assignment) {
    router.push({
      name: 'annotate_identification_task',
      params: {
        observationUuid: assignment.observation.uuid
      }
    })
  } else {
    toast.add(
      { severity: 'info', summary: 'Task queue empty', detail: 'No identification tasks available at the moment', life: 3000 }
    )
  }
}

</script>
