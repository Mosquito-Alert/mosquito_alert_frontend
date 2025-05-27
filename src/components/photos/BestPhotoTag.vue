<template>
  <Tag icon="pi pi-sparkles" severity="success" v-bind="props.mini ? { rounded: true } : { value: 'Best photo' }" />
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
  mini?: boolean,
}>(), {
  mini: false,
});
</script>
