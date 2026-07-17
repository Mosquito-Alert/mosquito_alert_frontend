<template>
  <div class="flex flex-col gap-4 w-full p2">
    <MessagesCreateFormRecipients :dialogRef="dialogRef" />
    <MessagesCreateFormContent
      v-if="messagesStore.showMessageCreationDetails"
      :dialogRef="dialogRef"
    />
  </div>
</template>
<script setup lang="ts">
import MessagesCreateFormContent from './MessagesCreateFormContent.vue'
import MessagesCreateFormRecipients from './MessagesCreateFormRecipients.vue'

import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import { inject, type ComputedRef } from 'vue'
import { useMessagesStore } from '../../../stores/messagesStore'

const messagesStore = useMessagesStore()

const dialogRef = inject<ComputedRef<DynamicDialogInstance>>('dialogRef')

// * Emits */
const emit = defineEmits(['onMessageSent'])
</script>
