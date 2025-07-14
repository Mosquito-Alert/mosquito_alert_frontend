<template>
  <Dialog :visible="$can('add', subject('Review', { 'identification_task': identificationTask }))"
    position='bottomright' header="Add review" :closable="false" :close-on-escape="false" :draggable="false">
    <span class=" text-surface-500 dark:text-surface-400 block mb-8">
      This identification task needs from your approval.
    </span>
    <div class="flex gap-2">
      <Button icon="pi pi-times" severity="danger" variant="outlined" label="Disagree" rounded />
      <Button icon="pi pi-check" severity="success" label="Agree" rounded class="flex-1" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { subject } from '@casl/ability';

import type { IdentificationTask } from 'mosquito-alert';

defineProps<{
  identificationTask: IdentificationTask
}>()
</script>
