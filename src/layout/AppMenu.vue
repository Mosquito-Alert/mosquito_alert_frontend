<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import type { MenuItem } from './AppMenuItem.vue'


const model = ref<MenuItem[]>([
  // {
  //   label: 'Home',
  //   items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: { name: 'home' } }]
  // },
  {
    label: 'Annotation tool',
    items: [
      // { label: 'Tasks', icon: 'pi pi-fw pi-list', to: { name: 'list_identification_tasks' } },
      { label: 'Annotations', icon: 'pi pi-fw pi-file-check', to: { name: 'list_annotations' } },
      // { label: 'Your annotations', icon: 'pi pi-fw pi-images', to: { name: 'list_identification_tasks' } },
    ]
  },

]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
