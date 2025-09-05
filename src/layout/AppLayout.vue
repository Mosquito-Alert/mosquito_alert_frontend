<template>
  <div class="layout-wrapper flex flex-col min-h-screen" :class="containerClass">
    <app-topbar></app-topbar>
    <app-sidebar></app-sidebar>
    <div class="layout-main-container flex flex-col flex-1">
      <div class="layout-main flex-1">
        <router-view></router-view>
      </div>
      <app-footer></app-footer>
    </div>
    <div class="layout-mask animate-fadein"></div>
  </div>
  <Toast />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useLayout } from '@/layout/composables/layout';

import AppTopbar from './AppTopbar.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const outsideClickListener = ref<((event: MouseEvent) => void) | null>(null);

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});

const containerClass = computed(() => {
  return {
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.staticMenuMobileActive
  };
});

function bindOutsideClickListener() {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: MouseEvent) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
      }
    };
    document.addEventListener('click', outsideClickListener.value);
  }
}

function unbindOutsideClickListener() {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value);
    outsideClickListener.value = null;
  }
}

function isOutsideClicked(event: MouseEvent): boolean {
  const sidebarEl = document.querySelector<HTMLElement>('.layout-sidebar');
  const topbarEl = document.querySelector<HTMLElement>('.layout-menu-button');

  if (!sidebarEl || !topbarEl) {
    // If either element is missing, consider it an outside click
    return true;
  }

  return !(
    sidebarEl.isSameNode(event.target as Node) ||
    sidebarEl.contains(event.target as Node) ||
    topbarEl.isSameNode(event.target as Node) ||
    topbarEl.contains(event.target as Node)
  );
}

</script>
