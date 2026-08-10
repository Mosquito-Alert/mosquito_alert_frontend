<template>
  <div class="flex items-center mr-4 border rounded-full border-gray-300">
    <UserAvatar :user="null" />
    <div class="flex items-center w-full mx-2 gap-1">
      <div class="leading-6 font-medium">
        {{ userUuid }}
      </div>
      <div class="ml-auto">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MinimalUser, SimpleUser, User } from 'mosquito-alert'
import { computed } from 'vue'

const props = defineProps<{
  user: MinimalUser | SimpleUser | User
}>()

// Compute the user UUID in lowercase and remove any leading or trailing whitespace for consistent display and comparison.
const userUuid = computed(() => props.user.uuid.toLowerCase().trim())
</script>
