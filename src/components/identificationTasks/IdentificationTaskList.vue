<template>
  <div class="flex-1 h-full overflow-hidden flex border border-surface rounded-2xl">
    <DataTable :value="tasks" ref="dt" stripedRows :loading="loading" data-key="observation.uuid" :pt="{
      root: {
        class: 'w-full flex-1 overflow-x-auto'
      },
    }">
      <!-- <template #header>
      <div style="text-align:left">
        <MultiSelect id="column_select" :modelValue="selectedColumns" :options="columns" optionLabel="header"
          @update:modelValue="onSelectColumn" display="chip" :maxSelectedLabels="0" filter selectedItemsLabel="Columns"
          placeholder="Columns" />
      </div>
    </template> -->
      <Column field="observation.uuid" header="UUID">
        <template #body="slotProps">
          <RouterLink
            :to="{ name: 'identification_task', params: { observationUuid: slotProps.data.observation.uuid } }" custom
            v-slot="{ href }">
            <a :href="href" target="_blank" class="flex items-center gap-2">
              <span class="hover:underline">{{ slotProps.data.observation.uuid }}</span>
              <i class="pi pi-external-link" style="font-size: 0.8rem" />
            </a>
          </RouterLink>
        </template>
      </Column>
      <Column field="observation.short_id" header="Short ID" />
      <Column header="Status">
        <template #body="slotProps">
          <IdentificationTaskStatusTag :status="slotProps.data.status" />
        </template>
      </Column>
      <Column header="Image">
        <template #body="slotProps">
          <Image :src="`${slotProps.data.public_photo.url}`" preview
            imageClass="aspect-square object-cover rounded w-16" />
        </template>
      </Column>
      <Column header="Taxon">
        <template #body="slotProps">
          <IdentificationTaskResultTag v-if="slotProps.data.result" :result="slotProps.data.result" />
        </template>
      </Column>
      <Column header="Country">
        <template #body="slotProps">
          <CountryTag v-if="slotProps.data.observation.location.country"
            :country="slotProps.data.observation.location.country" />
        </template>
      </Column>
      <Column header="Assignations">
        <template #body="slotProps">
          <AvatarGroup>
            <UserAvatar v-for="assignment, index in slotProps.data.assignments" :key="index" :user="assignment.user"
              v-tooltip.top="assignment.annotation_id === null ? `${assignment.user.full_name || assignment.user.username} (Pending)` : assignment.user.full_name || assignment.user.username"
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
      <!-- <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header"
      :key="col.field + '_' + index">
    </Column> -->

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
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import type { ColumnProps } from 'primevue/column';
import type { DataTableRowClickEvent } from 'primevue';

import type { IdentificationTask } from 'mosquito-alert';

import CountryTag from '@/components/countries/CountryTag.vue';
import IdentificationTaskStatusTag from '@/components/identificationTasks/IdentificationTaskStatusTag.vue';
import IdentificationTaskResultTag from '@/components/identificationTasks/IdentificationTaskResultTag.vue';
import UserAvatar from '@/components/users/UserAvatar.vue';

import { formatLocalDateTime } from '@/utils/DateUtils';

defineProps<{
  tasks: IdentificationTask[],
  loading: boolean
}>()

const router = useRouter();

const dt = ref();
const exportCSV = () => {
  dt.value.exportCSV();
};

const columns = ref<Partial<ColumnProps>[]>([
  // { field: 'num_annotations', header: 'Annotations' },
  // { field: 'is_flagged', header: 'Is Flagged' },
  { field: 'result.taxon.name', header: 'Result' },
]);
const selectedColumns = ref(columns.value);

const onSelectColumn = (value: Partial<ColumnProps>[]) => {
  selectedColumns.value = columns.value.filter(col => value.includes(col));
};


defineExpose({
  exportCSV,
});

</script>
