<template>
  <Tag :icon="isSafe ? 'pi pi-shield' : 'pi pi-eye-slash'" :value="isSafe ? 'Safe content' : 'Hidden'"
    :severity="isSafe ? 'success' : 'danger'" />
</template>

<script setup lang="ts">

defineProps<{
  isSafe: boolean;
}>();

</script>
