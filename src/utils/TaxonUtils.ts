import type { Taxon, SimpleTaxon, TaxonTreeNode } from 'mosquito-alert'

import { useTaxaStore } from '@/stores/taxaStore'

const taxaStore = useTaxaStore()

export function getTaxonAncestors(taxon: Taxon | SimpleTaxon): TaxonTreeNode[] | null {
  const path: TaxonTreeNode[] = []

  function dfs(node: TaxonTreeNode): boolean {
    if (node.id === taxon.id) {
      return true
    }

    for (const child of node.children) {
      if (dfs(child)) {
        path.push(node)
        return true
      }
    }

    return false
  }

  if (!taxaStore.treeNode) {
    taxaStore.fetchTaxaTree()
  }
  if (dfs(taxaStore.treeNode!)) {
    return path // NOTE: Not reverse to get order from parent to root
  }

  return null // Target not found
}
