<template>
  <div class="flex-1 h-full overflow-hidden flex border border-surface rounded-2xl">
    <DataTable :value="annotations" ref="dt" stripedRows :loading="loading" data-key="id" class="overflow-y-auto" :pt="{
      root: {
        class: 'w-full flex-1 overflow-x-auto'
      },
    }">
      <Column header="Observation UUID">
        <template #body="slotProps">
          <Button asChild variant="link">
            <RouterLink
              :to="{ name: 'identification_task', params: { observationUuid: slotProps.data.observation_uuid } }" custom
              v-slot="{ href }">
              <a :href="href" target="_blank" class="flex items-center gap-2">
                <span class="hover:underline">{{ slotProps.data.observation_uuid }}</span>
                <i class="pi pi-external-link" style="font-size: 0.8rem" />
              </a>
            </RouterLink>
          </Button>
        </template>
      </Column>
      <Column header="Type">
        <template #body="slotProps">
          <AnnotationTypeTag :type="slotProps.data.type" />
        </template>
      </Column>
      <Column header="Best image">
        <template #body="slotProps">
          <Image v-if="slotProps.data.best_photo" :src="`${slotProps.data.best_photo.url}`" preview
            imageClass="aspect-square object-cover rounded w-16" />
        </template>
      </Column>

      <Column header="Classification">
        <template #body="slotProps">
          <TaxonClassificationTag :classification="slotProps.data.classification"
            :sex="slotProps.data.characteristics?.sex" />
        </template>
      </Column>
      <Column field="is_flagged" header="Is flagged" dataType="boolean" style="min-width: 6rem">
        <template #body="slotProps">
          <i class="pi"
            :class="{ 'pi-check-circle text-green-500': slotProps.data.is_flagged, 'pi-times-circle text-red-400': !slotProps.data.is_flagged }" />
        </template>
      </Column>
      <!-- <Column field="is_decisive" header="Is executive" dataType="boolean" style="min-width: 6rem">
      <template #body="slotProps">
        <i class="pi"
          :class="{ 'pi-check-circle text-green-500': slotProps.data.is_decisive, 'pi-times-circle text-red-400': !slotProps.data.is_decisive }" />
      </template>
    </Column> -->
      <Column field="is_favourite" header="Is Favourite" dataType="boolean" style="min-width: 6rem">
        <template #body="slotProps">
          <i class="pi"
            :class="{ 'pi-check-circle text-green-500': slotProps.data.observation_flags.is_favourite, 'pi-times-circle text-red-400': !slotProps.data.observation_flags.is_favourite }" />
        </template>
      </Column>
      <Column header="Date">
        <template #body="slotProps">
          {{ formatLocalDateTime(slotProps.data.updated_at) }}
        </template>
      </Column>
      <template #expansion="slotProps">
        <p><span class="font-bold">Public note: </span>{{ slotProps.data.feedback.public_note }}</p>
        <p><span class="font-bold">Internal note: </span>{{ slotProps.data.feedback.internal_note }}</p>
      </template>
    </DataTable>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import type { Annotation } from 'mosquito-alert';
import { formatLocalDateTime } from '@/utils/DateUtils';
import AnnotationTypeTag from './AnnotationTypeTag.vue';
import TaxonClassificationTag from '../taxa/TaxonClassificationTag.vue';

defineProps<{
  annotations: Annotation[],
  loading: boolean
}>()

const dt = ref();
const exportCSV = () => {
  dt.value.exportCSV();
};

defineExpose({
  exportCSV,
});

</script>
