<template>
  <div class="flex items-center justify-between mr-4 border rounded-full border-gray-300">
    <UserAvatar :user="null" />
    <div class="flex mx-2 relative gap-1 items-center">
      <div class="leading-6 font-medium">
        {{ user.uuid }}
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MinimalUser, SimpleUser, User } from 'mosquito-alert';

defineProps<{
  user: MinimalUser | SimpleUser | User
}>()
</script>
