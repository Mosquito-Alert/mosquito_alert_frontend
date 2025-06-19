<template>
  <Avatar icon="pi pi-user" shape="circle" :label="getInitials(user?.full_name || user?.username || '')" />
</template>

<script setup lang="ts">
import { getInitials } from '@/utils/Utils';
import type { User, SimpleAnnotatorUser } from 'mosquito-alert';

defineProps<{
  user: User | SimpleAnnotatorUser | null
}>();
</script>
