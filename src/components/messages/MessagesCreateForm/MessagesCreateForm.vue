<template>
  <div class="flex flex-col gap-4 w-full p-2">
    <div>
      <SelectButton
        v-model="messagesStore.target"
        :options="messageTargetOptions"
        optionLabel="label"
        optionValue="value"
        aria-labelledby="basic"
      >
        <template #option="slotProps">
          <div class="flex items-center justify-center">
            <i class="mr-2" :class="slotProps.option.icon" />
            <span>{{ slotProps.option.label }} </span>
          </div>
        </template>
      </SelectButton>
    </div>
    <div class="flex flex-col gap-4">
      <MessagesCreateFormRecipients :dialogRef="dialogRef" />
      <MessagesCreateFormContent
        v-if="messagesStore.showMessageCreationDetails"
        :dialogRef="dialogRef"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import MessagesCreateFormContent from './MessagesCreateFormContent.vue'
import MessagesCreateFormRecipients from './MessagesCreateFormRecipients.vue'

import {
  MessageTarget,
  type LocalizedAudienceMessageTitleRequest,
  type LocalizedMessageTitleRequest,
  type LocalizedMessageBodyRequest,
} from 'mosquito-alert'
import { SelectButton } from 'primevue'
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import { inject, watch, type ComputedRef } from 'vue'
import { useMessagesStore } from '../../../stores/messagesStore'

const messagesStore = useMessagesStore()

const dialogRef = inject<ComputedRef<DynamicDialogInstance>>('dialogRef')

const messageTargetOptions = [
  { label: 'Specific users', icon: 'pi pi-user', value: MessageTarget.Users },
  { label: 'Filtered audience', icon: 'pi pi-megaphone', value: MessageTarget.Audience },
]

watch(
  () => messagesStore.target,
  () => {
    // Clear recipients when form type changes
    messagesStore.setRecipients(null)
    // Clear audience when form type changes
    messagesStore.clearAudience()
    messagesStore.subjectByLanguage = {} as Record<
      keyof LocalizedMessageTitleRequest | keyof LocalizedAudienceMessageTitleRequest,
      string | undefined
    >
    messagesStore.bodyByLanguage = {} as Record<
      keyof LocalizedMessageBodyRequest,
      string | undefined
    >
  },
)
</script>
