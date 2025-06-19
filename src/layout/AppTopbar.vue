<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <Image src="/logo.png" alt="Logo" width="40" />

        <span>Mosquito Alert</span>
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <!-- <button class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }">
        <i class="pi pi-ellipsis-v"></i>
      </button> -->

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <!-- <button type="button" class="layout-topbar-action">
            <i class="pi pi-calendar"></i>
            <span>Calendar</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-inbox"></i>
            <span>Messages</span>
          </button> -->
          <!-- <button type="button" class="layout-topbar-action" @click="profileMenuToggle">
            <i class="pi pi-user"></i>
            <span>Profile</span>
            <Menu ref="profileMenu" id="overlay_menu" :model="profileMenuItems" :popup="true" />
          </button> -->
          <Button class="p-2!" icon="pi pi-user" :label="username" rounded variant="outlined" severity="secondary"
            @click="profileMenuToggle">
            <template #icon>
              <UserAvatar :user="userStore.user" />
            </template>
          </Button>
          <Menu ref="profileMenu" id="overlay_menu" :model="profileMenuItems" :popup="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useLayout } from './composables/layout';
import UserAvatar from '@/components/users/UserAvatar.vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';

const { toggleMenu } = useLayout();

const router = useRouter();

const authStore = useAuthStore();
const userStore = useUserStore();

const username = ref(userStore.user?.username || 'Guest');

const profileMenu = ref();
const profileMenuItems = ref([
  {
    label: 'Profile',
    items: [
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          authStore.logout();
          // Redirect to login page after logout
          router.push({ name: 'login' });
        }
      },
    ]
  }
]);

const profileMenuToggle = (event: MouseEvent) => {
  profileMenu.value.toggle(event);
};


</script>
