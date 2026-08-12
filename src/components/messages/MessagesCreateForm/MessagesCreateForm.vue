<template>
  <div class="flex flex-col gap-4 w-4xl p-2">
    <div>
      <SelectButton
        v-model="messagesStore.target"
        :options="messagesStore.messageTargetOptions"
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
    <div class="flex flex-col gap-4 w-full">
      <!-- * RECIPIENTS -->
      <!-- Users -->
      <MessagesCreateFormUsersRecipients
        v-if="messagesStore.target === MessageTarget.Users"
        :dialogRef="dialogRef"
      />
      <!-- Audience -->
      <MessagesCreateFormAudienceRecipients
        v-else-if="messagesStore.target === MessageTarget.Audience"
      />
      <!-- * CONTENT -->
      <MessagesCreateFormContent
        v-if="messagesStore.showMessageCreationDetails"
        :dialogRef="dialogRef"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import MessagesCreateFormContent from './MessagesCreateFormContent.vue'
import MessagesCreateFormUsersRecipients from './MessagesCreateFormUsersRecipients.vue'
import MessagesCreateFormAudienceRecipients from './MessagesCreateFormAudienceRecipients.vue'

import {
  MessageTarget,
  type LocalizedAudienceMessageTitleRequest,
  type LocalizedMessageTitleRequest,
  type LocalizedMessageBodyRequest,
} from 'mosquito-alert'
import { SelectButton } from 'primevue'
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import { inject, onUnmounted, watch, type ComputedRef } from 'vue'
import { useMessagesStore } from '../../../stores/messagesStore'

const messagesStore = useMessagesStore()

const dialogRef = inject<ComputedRef<DynamicDialogInstance>>('dialogRef')

onUnmounted(() => {
  messagesStore.clearMessageCreation()
})

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
