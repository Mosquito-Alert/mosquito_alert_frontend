<template>
  <TreeSelect :modelValue="selectedValue" @update:modelValue="onNodeChange" filter showClear :options="nodes"
    :expandedKeys="collectExpandedKeys(taxonTreeNode!)" :placeholder="placeholder ?? undefined" :class="{
      'italic': props.modelValue?.italicize,
    }" :loading="loading">
    <template #value="{ value, placeholder }">
      <slot name="value" :value="value" :placeholder="placeholder" />
    </template>
  </TreeSelect>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import type { TreeNode } from 'primevue/treenode';
import type { TreeExpandedKeys } from 'primevue/tree';

import type { Taxon, TaxonTreeNode } from 'mosquito-alert';

import { useTaxaStore } from '@/stores/taxaStore';

const taxaStore = useTaxaStore();

const loading = ref<boolean>(false);

const taxonTreeNode = ref<TaxonTreeNode>();
const selectedValue = ref<Record<number, boolean> | null>(null);

const props = defineProps<{
  modelValue?: Taxon | null,
  placeholder?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Taxon | undefined): void,
  (e: 'onChange', value: Taxon | undefined): void
}>()

onMounted(async () => {
  await fetchTaxaTree();
})

const nodes = computed<TreeNode[]>(() => {
  if (!taxonTreeNode.value) return [] as TreeNode[];
  return [convertTaxonTreeNodeToTreeNode(taxonTreeNode.value)];
});

watch(() => props.modelValue, (newVal) => {
  if (newVal && nodes.value.length) {
    // Delay setting selectedValue until next tick to ensure tree is mounted
    const foundNode = findNodeByKey(nodes.value, newVal.id.toString());
    selectedValue.value = foundNode ? { [foundNode.key]: true } : null;
  } else {
    selectedValue.value = null
  }
}, { immediate: true })


function onNodeChange(newVal: Record<number, boolean> | null) {
  if (!newVal) {
    // Handle null case, maybe emit null or do nothing
    emit('update:modelValue', undefined);
    emit('onChange', undefined)
    return;
  }

  const taxonId = Object.keys(newVal)[0]
  const foundNode = findNodeByKey(nodes.value, taxonId.toString());
  emit('update:modelValue', foundNode?.data as Taxon)
  emit('onChange', foundNode?.data as Taxon)
}

async function fetchTaxaTree() {
  if (!taxaStore.treeNode) {
    loading.value = true
    await taxaStore.fetchTaxaTree();
    loading.value = false
  }
  taxonTreeNode.value = taxaStore.treeNode as TaxonTreeNode;
}

function findNodeByKey(nodes: TreeNode[], key: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) {
        return found;
      }
    }
  }
  return undefined; // Not found
}

function convertTaxonTreeNodeToTreeNode(taxonNode: TaxonTreeNode): TreeNode {
  return {
    key: taxonNode.id.toString(),
    label: taxonNode.name,
    data: <Taxon>{
      id: taxonNode.id,
      name: taxonNode.name,
      common_name: taxonNode.common_name,
      rank: taxonNode.rank,
      italicize: taxonNode.italicize,
      is_relevant: taxonNode.is_relevant,
    },
    children: taxonNode.children.length > 0 ? taxonNode.children.map(convertTaxonTreeNodeToTreeNode) : undefined,  // Recursively convert children
    selectable: true,  // Set this to true or based on any condition
    leaf: taxonNode.children.length === 0,  // If no children, it's a leaf
    styleClass: taxonNode.italicize ? 'italic' : '',  // Optionally apply a style class based on `italicize`
  };
}

function collectExpandedKeys(node: TaxonTreeNode): TreeExpandedKeys {
  const keys: TreeExpandedKeys = {};
  if (!node) return {}
  if (node.children.length > 0) {
    keys[node.id.toString()] = true;
    for (const child of node.children) {
      Object.assign(keys, collectExpandedKeys(child));
    }
  }
  return keys;
}

</script>
