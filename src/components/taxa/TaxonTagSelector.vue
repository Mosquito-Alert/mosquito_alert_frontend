<template>
  <div class="flex flex-wrap justify-center gap-2">
    <ToggleButton v-for="taxon in [...relevantTaxa].sort((a, b) => a.name.localeCompare(b.name))" :key="taxon.id"
      :modelValue="selectedTaxon === taxon" :onLabel="taxon.name" :offLabel="taxon.name"
      :class="{ 'italic': taxon.italicize }" @update:modelValue="(value) => {
        selectedTaxonOnTree = undefined; // Reset the tree selection when a taxon is selected
        if (value) selectedTaxon = taxon;
        else if (selectedTaxon === taxon) selectedTaxon = undefined;
      }">
      <template #icon>
        <template v-if="selectedTaxon === taxon">
          <slot name="selectedIcon" />
        </template>
      </template>
    </ToggleButton>
    <TaxonTreeSelect v-model="selectedTaxonOnTree" placeholder="Other taxon"
      @on-change="(value) => { selectedTaxon = value }">
      <template #value="{ value, placeholder }">
        <template v-if="value && value.length">
          <div v-for="node of value" :key="node.key">
            <Chip :label="node.label">
              <template #icon>
                <template v-if="node.data.id === selectedTaxon?.id">
                  <slot name="selectedIcon" />
                </template>
              </template>
            </Chip>
          </div>
        </template>
        <template v-else>
          {{ placeholder || 'empty' }}
        </template>
      </template>
    </TaxonTreeSelect>
  </div>

</template>

<script setup lang="ts">

import { onMounted, ref, watch, watchEffect } from 'vue';

import type { Taxon } from 'mosquito-alert';

import TaxonTreeSelect from './TaxonTreeSelect.vue';

import { useTaxaStore } from '@/stores/taxaStore';

const taxaStore = useTaxaStore();

const relevantTaxa = ref<Taxon[]>([]);
const selectedTaxonOnTree = ref<Taxon>();
const selectedTaxon = ref<Taxon>();

const props = defineProps<({
  modelValue?: Taxon;
})>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Taxon | undefined): void
}>()

watch(selectedTaxon, (newValue) => {
  emit('update:modelValue', newValue)
})

watchEffect(() => {
  const modelValue = props.modelValue
  if (!modelValue) return

  const isInRelevantTaxa = relevantTaxa.value.some(
    taxon => taxon.id === modelValue.id
  )

  selectedTaxon.value = modelValue
  selectedTaxonOnTree.value = isInRelevantTaxa ? undefined : modelValue
})

onMounted(async () => {
  if (taxaStore.relevant.length === 0) {
    await taxaStore.fetchRelevant();
  }
  relevantTaxa.value = taxaStore.relevant as Taxon[];
})

</script>
