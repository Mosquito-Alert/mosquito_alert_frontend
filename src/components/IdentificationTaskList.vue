<template>
  <DataTable :value="tasks" ref="dt" stripedRows :loading="loading" data-key="observation.uuid" row-hover
    selectionMode="single" @rowClick="goToAnnotation">
    <template #header>
      <div style="text-align:left">
        <MultiSelect id="column_select" :modelValue="selectedColumns" :options="columns" optionLabel="header"
          @update:modelValue="onSelectColumn" display="chip" :maxSelectedLabels="0" filter selectedItemsLabel="Columns"
          placeholder="Columns" />
      </div>
    </template>
    <Column field="observation.uuid" header="UUID" />
    <Column header="Image">
      <template #body="slotProps">
        <Image :src="`${slotProps.data.public_photo.url}`" preview
          imageClass="aspect-square object-cover rounded w-16" />
      </template>
    </Column>

    <Column header="Country">
      <template #body="slotProps">
        <div class="flex items-center gap-2">
          <i :class="`flag flag-${slotProps.data.observation.location.country?.iso3_code.toLowerCase()} rounded`"
            style="width: 24px" />
          <span>{{ slotProps.data.observation.location.country?.name_en }}</span>
        </div>
      </template>
    </Column>
    <Column header="Assignations">
      <template #body="slotProps">
        <AvatarGroup>
          <Avatar v-for="assignment, index in slotProps.data.assignments" :key="index" icon="pi pi-user" shape="circle"
            :label="getInitials(assignment.user.full_name)"
            v-tooltip.top="assignment.annotation_id === null ? `${assignment.user.full_name} (Pending)` : assignment.user.full_name"
            :class="assignment.annotation_id ? '' : 'border-(--p-tag-warn-color)! bg-(--p-tag-warn-background)! text-(--p-tag-warn-color)!'" />
        </AvatarGroup>
      </template>
    </Column>
    <Column field="is_flagged" header="Is flagged" dataType="boolean" style="min-width: 6rem">
      <template #body="slotProps">
        <i class="pi"
          :class="{ 'pi-check-circle text-green-500': slotProps.data.is_flagged, 'pi-times-circle text-red-400': !slotProps.data.is_flagged }" />
      </template>
    </Column>
    <Column field="is_safe" header="Is Safe" dataType="boolean" style="min-width: 6rem">
      <template #body="slotProps">
        <i v-if='slotProps.data.is_safe' class="pi pi-shield text-green-500" />

      </template>
    </Column>
    <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header"
      :key="col.field + '_' + index">
    </Column>
    <Column header="Status">
      <template #body="slotProps">
        <Tag :value="slotProps.data.status.toUpperCase()" :severity="getStatusSeverity(slotProps.data.status)" />
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
  </DataTable>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { IdentificationTask } from 'mosquito-alert';
import { getStatusSeverity } from '@/utils/IdentificationTaskUtils';
import { formatLocalDateTime } from '@/utils/DateUtils';
import { getInitials } from '@/utils/Utils';

defineProps<{
  tasks: IdentificationTask[],
  loading: boolean
}>()

const router = useRouter();

const dt = ref();
const exportCSV = () => {
  dt.value.exportCSV();
};

const columns = ref([
  // { field: 'num_annotations', header: 'Annotations' },
  // { field: 'is_flagged', header: 'Is Flagged' },
  { field: 'result.taxon.name', header: 'Result' },
]);
const selectedColumns = ref(columns.value);

const onSelectColumn = (value) => {
  selectedColumns.value = columns.value.filter(col => value.includes(col));
};

function goToAnnotation(event) {
  router.push({ name: 'identification_task', params: { observationUuid: event.data.observation.uuid } });
}


defineExpose({
  exportCSV,
});

</script>
