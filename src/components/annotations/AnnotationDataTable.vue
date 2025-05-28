<template>
  <DataTable v-model:expandedRows="expandedRows" :value="annotations" ref="dt" stripedRows :loading="loading"
    data-key="id" class="overflow-y-auto">
    <template #header>
      <div class="flex flex-wrap justify-end gap-2">
        <Button text icon="pi pi-plus" label="Expand All" severity="secondary" @click="expandAll" />
        <Button text icon="pi pi-minus" label="Collapse All" severity="secondary" @click="collapseAll" />
      </div>
    </template>
    <Column expander style="width: 5rem" />
    <Column field="observation_uuid" header="Observation UUID" />
    <Column header="Best image">
      <template #body="slotProps">
        <Image v-if="slotProps.data.best_photo" :src="`${slotProps.data.best_photo.url}`" preview
          imageClass="aspect-square object-cover rounded w-16" />
      </template>
    </Column>

    <Column header="Classification">
      <template #body="slotProps">
        <TaxonClassificationTag :classification="slotProps.data.classification" />
      </template>
    </Column>
    <Column field="is_flagged" header="Is flagged" dataType="boolean" style="min-width: 6rem">
      <template #body="slotProps">
        <i class="pi"
          :class="{ 'pi-check-circle text-green-500': slotProps.data.is_flagged, 'pi-times-circle text-red-400': !slotProps.data.is_flagged }" />
      </template>
    </Column>
    <Column field="is_decisive" header="Is Decisive" dataType="boolean" style="min-width: 6rem">
      <template #body="slotProps">
        <i class="pi"
          :class="{ 'pi-check-circle text-green-500': slotProps.data.is_decisive, 'pi-times-circle text-red-400': !slotProps.data.is_decisive }" />
      </template>
    </Column>
    <Column header="Created at">
      <template #body="slotProps">
        {{ formatLocalDateTime(slotProps.data.created_at) }}
      </template>
    </Column>
    <Column header="Last updated">
      <template #body="slotProps">
        {{ formatLocalDateTime(slotProps.data.updated_at) }}
      </template>
    </Column>
    <template #expansion="slotProps">
      <p><span class="font-bold">Public note: </span>{{ slotProps.data.feedback.public_note }}</p>
      <p><span class="font-bold">Internal note: </span>{{ slotProps.data.feedback.internal_note }}</p>
    </template>
  </DataTable>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import type { Annotation } from 'mosquito-alert';
import { formatLocalDateTime } from '@/utils/DateUtils';
import TaxonClassificationTag from '../taxa/TaxonClassificationTag.vue';

const props = defineProps<{
  annotations: Annotation[],
  loading: boolean
}>()

const expandedRows = ref({});

const dt = ref();
const exportCSV = () => {
  dt.value.exportCSV();
};

const expandAll = () => {
  expandedRows.value = props.annotations.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};
const collapseAll = () => {
  expandedRows.value = {};
};

defineExpose({
  exportCSV,
});

</script>
