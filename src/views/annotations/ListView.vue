<template>
  <div class="card">
    <div class="flex flex-row">
      <h4 class="m-0!">Your annotations</h4>
      <AnnotationStartButton class="ml-auto" />
    </div>
    <!-- Header panel + filter panel -->
    <div class="flex flex-col py-4 gap-4">
      <div class="flex flex-row">
        <div class="flex gap-2">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText placeholder="Search by uuid"
              @keydown.enter="searchValue = ($event.currentTarget as HTMLInputElement).value" />
          </IconField>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <Button :icon="showFilters ? 'pi pi-filter-fill' : 'pi pi-filter'" variant="outlined"
            :severity="showFilters ? 'contrast' : 'secondary'" @click="showFilters = !showFilters"
            v-tooltip.top="'Show/hide filter panel'" />
          <Select v-model="selectedOrderBy" :options="orderByArray" optionLabel="label" variant="outlined"
            dropdown-icon="pi pi-sort-alt" />
          <Divider layout="vertical" class="my-0" />
          <Button icon="pi pi-refresh" :loading="loading" severity="secondary" @click="fetchData" variant="outlined" />
        </div>
      </div>
      <Panel v-show="showFilters" header="Filters" class="mb-4" :pt="{
        content: {
          class: 'flex flex-wrap items-center gap-2'
        },
      }">
        <FloatLabel variant="on">
          <AnnotationTypeSelect v-model="selectedType" />
          <label for="type">Type</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <TaxonTreeSelect id="taxaFilter" v-model="selectedTaxon" />
          <label for="taxaFilter">Taxa</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <Select id="is_flagged" v-model="isFlagged" class="w-28" :options="[true, false]" showClear />
          <label for="is_flagged">Flag</label>
        </FloatLabel>
        <!-- <FloatLabel variant="on">
              <Select id="is_executive" v-model="isExecutive" class="w-28" :options="[true, false]" showClear />
              <label for="is_executive">Executive</label>
            </FloatLabel> -->
        <FloatLabel variant="on">
          <Select id="is_favourite" v-model="isFavourite" class="w-28" :options="[true, false]" showClear />
          <label for="is_favourite">Favourite</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <DatePicker id="date_filter" v-model="selectedDateRange" showIcon iconDisplay="input" :max-date="new Date()"
            selectionMode="range" :manualInput="false" showButtonBar />
          <label for="date_filter">Date</label>
        </FloatLabel>
        <Button icon="pi pi-filter-slash" label="Clear" @click="clearFilters" />
      </Panel>
    </div>

    <DataView :value="annotationsArray" dataKey='id' v-model:rows="numRows" :total-records="annotationsTotalCount" lazy
      paginator :rowsPerPageOptions="[5, 10, 25, 50]" @page="onPageChange"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="({totalRecords} items)">
      <template #list="slotProps">
        <AnnotationDataTable ref='annotationsList' :annotations="slotProps.items" :loading="loading" />
      </template>
    </DataView>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { DataViewPageEvent } from 'primevue/dataview'

import { IdentificationtasksListOrderByParameter, AnnotationType } from 'mosquito-alert';
import type { Annotation, IdentificationTasksApiAnnotationsListMineRequest, Taxon } from 'mosquito-alert';

import AnnotationDataTable from '@/components/annotations/AnnotationDataTable.vue';
import AnnotationStartButton from '@/components/annotations/AnnotationStartButton.vue';
import TaxonTreeSelect from '@/components/taxa/TaxonTreeSelect.vue';
import AnnotationTypeSelect from '@/components/annotations/AnnotationTypeSelect.vue';
import { identificationTasksApi } from '@/services/apiService';

const route = useRoute()
const router = useRouter()

const annotationsList = ref();

const pageSelected = ref<number>(0);

const loading = ref<boolean>(false);
const showFilters = ref<boolean>(false);

// Filters
const searchValue = ref<string>();
const selectedDateRange = ref<Date[]>();
const isExecutive = ref<boolean>();
const isFlagged = ref<boolean>();
const isFavourite = ref<boolean>();
const selectedTaxon = ref<Taxon | null>(null);
const selectedType = ref<AnnotationType>();

const numRows = ref<number>(25);
const onPageChange = (event: DataViewPageEvent) => {
  pageSelected.value = event.page
}


const selectedOrderBy = ref<{
  value: IdentificationtasksListOrderByParameter,
  label: string
}>({
  value: IdentificationtasksListOrderByParameter.MinusUpdatedAt,
  label: 'Last annotated'
})
const orderByArray = ref<Array<{ value: IdentificationtasksListOrderByParameter; label: string }>>([
  { value: IdentificationtasksListOrderByParameter.MinusUpdatedAt, label: 'Last annotated' },
  { value: IdentificationtasksListOrderByParameter.UpdatedAt, label: 'First annotated' },
]);

const annotationsTotalCount = ref<number>(0);
const annotationsArray = ref<Annotation[]>([]);

function clearFilters() {
  selectedDateRange.value = undefined;
  isExecutive.value = undefined;
  isFlagged.value = undefined;
  isFavourite.value = undefined;
  selectedTaxon.value = null;
  selectedType.value = undefined;
}

onMounted(() => {
  // Initialize filters from route query params
  const q = route.query

  if (q.updatedAtAfter && q.updatedAtBefore) {
    selectedDateRange.value = [
      new Date(q.updatedAtAfter as string),
      new Date(q.updatedAtBefore as string),
    ] as Date[];
  }

  isExecutive.value = q.isDecisive ? Boolean(JSON.parse(q.isDecisive as string)) : undefined;
  isFlagged.value = q.isFlagged ? Boolean(JSON.parse(q.isFlagged as string)) : undefined;
  isFavourite.value = q.isFavourite ? Boolean(JSON.parse(q.isFavourite as string)) : undefined;

  pageSelected.value = q.page ? Number(q.page) - 1 : 0
  numRows.value = q.pageSize ? Number(q.pageSize) : 25

  // selectedOrderBy.value = q.orderBy ? { value: (q.orderBy as string).split(',')[0] } : null
  fetchData();
})

const listRequest = computed<IdentificationTasksApiAnnotationsListMineRequest>(() => ({
  updatedAtAfter: selectedDateRange.value && selectedDateRange.value.length > 1 ? selectedDateRange.value[0].toISOString() : undefined,
  updatedAtBefore: selectedDateRange.value && selectedDateRange.value.length > 1 ? new Date(new Date(selectedDateRange.value[1]).setDate(selectedDateRange.value[1].getDate() + 1)).toISOString() : undefined,
  isDecisive: isExecutive.value ?? undefined,
  isFlagged: isFlagged.value ?? undefined,
  isFavourite: isFavourite.value ?? undefined,
  classificationTaxonIds: selectedTaxon.value?.id ? [selectedTaxon.value.id] : undefined,
  type: selectedType.value ?? undefined,
  search: searchValue.value || undefined,
  page: pageSelected.value + 1,
  pageSize: numRows.value,
  orderBy: selectedOrderBy.value ? [selectedOrderBy.value.value] : undefined
}) satisfies IdentificationTasksApiAnnotationsListMineRequest);

const fetchData = async () => {
  loading.value = true;
  await identificationTasksApi.annotationsListMine(listRequest.value).then(
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


// Watch the computed request and update both listRequest and URL
watch(listRequest, async () => {
  await fetchData();

  const query = Object.fromEntries(
    Object.entries(listRequest.value)
      .filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => Array.isArray(v) ? [k, v.join(',')] : [k, v])
  )

  router.replace({ query })
}, { deep: true })

</script>
