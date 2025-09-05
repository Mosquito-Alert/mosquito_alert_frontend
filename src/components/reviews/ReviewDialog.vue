<template>
  <Dialog :visible="visible" position='bottomright' header="Confirm identification result" :closable="false"
    :close-on-escape="false" :draggable="false">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">
      Do you approve this identification task?
    </span>
    <div class="flex gap-2">
      <Button icon="pi pi-times" severity="danger" variant="outlined" label="Disagree" rounded :loading="loading"
        @click="$emit('disagree')" />
      <Button icon="pi pi-check" severity="success" label="Agree" rounded class="flex-1" :loading="loading"
        @click="$emit('agree')" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">

withDefaults(defineProps<{
  loading?: boolean
  visible?: boolean
}>(), {
  loading: false,
  visible: true
});

// Emits
defineEmits<{
  (e: 'agree'): void
  (e: 'disagree'): void
}>();
</script>
