<template>
  <UserChip :user="user">
    <span v-if="user.locale" class="text-surface-500 dark:text-surface-300">
      ({{ getLanguageName(user.locale) }})
    </span>
    <span class="material-symbols-outlined" v-tooltip.bottom="has_read ? 'Read' : 'Unread'"
      :class="has_read ? 'text-blue-500' : 'text-gray-400'" style="font-size: 18px;">
      done_all
    </span>
  </UserChip>
</template>

<script setup lang="ts">
import type { MinimalUser } from 'mosquito-alert';

import { getLanguageName } from '@/utils/Utils';
import UserChip from '../users/UserChip.vue';

defineProps<{
  user: MinimalUser,
  has_read?: boolean
}>()
</script>
