<template>
  <div class="card">
    <div class="flex">
      <div class="flex flex-1 flex-col gap-4">
        <div class="flex items-center gap-2">
          <span>From:</span>
          <div v-if="messagesStore.messageDetail" class="flex items-center">
            <UserAvatar :user="messagesStore.messageDetail.sender_user" />
            <div class="ml-2 leading-6 text-color font-medium">
              {{
                messagesStore.messageDetail.sender_user.full_name ||
                messagesStore.messageDetail.sender_user.username
              }}
            </div>
          </div>
          <Skeleton v-else />
          <div class="ml-auto">
            <InputGroup>
              <InputGroupAddon>
                <i class="pi pi-language" />
              </InputGroupAddon>
              <Select
                :options="messagesStore.messageDetailAvailableLanguages"
                v-model="messagesStore.messageDetailSelectedLanguage"
                :optionLabel="(value) => getLanguageName(value)"
              />
            </InputGroup>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            >To
            <span v-if="!messagesStore.loadingRecipients" class="text-muted-color">
              ({{ messagesStore.recipientsTotalReadCount }} reads of
              {{ messagesStore.recipientsTotalCount }})
            </span>
            :
          </span>
          <div class="flex flex-1 flex-wrap gap-2 overflow-auto max-h-48">
            <Skeleton v-if="messagesStore.loadingRecipients" />
            <MessageRecipientChip
              v-else-if="messagesStore.recipientsTotalCount < 100"
              v-for="recipient in messagesStore.recipients"
              :key="recipient.user.uuid"
              :user="recipient.user"
              :has_read="recipient.has_read"
            />
            <VirtualScroller
              v-else
              :items="messagesStore.recipients"
              :itemSize="50"
              class="border border-surface-200 dark:border-surface-700 rounded w-full"
              style="height: 200px"
            >
              <template v-slot:item="{ item }">
                <MessageRecipientChip :user="item.user" :has_read="item.has_read" />
              </template>
            </VirtualScroller>
          </div>
          <div class="flex ml-auto">
            <div class="flex ml-auto">
              <span v-if="messagesStore.messageDetail" class="text-muted-color">{{
                formatLocalDateTime(messagesStore.messageDetail.created_at)
              }}</span>
              <Skeleton v-else />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Divider />
    <div v-if="messagesStore.messageDetail">
      <h2 class="text-2xl font-bold mb-4">
        {{ getTitle(messagesStore.messageDetail, messagesStore.messageDetailSelectedLanguage) }}
      </h2>
      <div
        v-html="getBody(messagesStore.messageDetail, messagesStore.messageDetailSelectedLanguage)"
      ></div>
    </div>
    <div v-else class="flex items-center justify-center h-full w-full py-10">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import MessageRecipientChip from '@/components/messages/MessageRecipientChip.vue'
import UserAvatar from '@/components/users/UserAvatar.vue'
import { formatLocalDateTime } from '@/utils/DateUtils'
import { getLanguageName } from '@/utils/Utils'
import type { LocalizedMessageTitle, Message } from 'mosquito-alert'
import { onMounted } from 'vue'
import { useMessagesStore } from '../../stores/messagesStore'

const messagesStore = useMessagesStore()

const props = defineProps<{
  messageId: number
}>()

function getTitle(message: Message, language: keyof LocalizedMessageTitle) {
  return messagesStore.messageDetail?.content?.title?.[language] || 'No title'
}

function getBody(message: Message, language: keyof LocalizedMessageTitle) {
  return messagesStore.messageDetail?.content?.body?.[language] || 'No content'
}

onMounted(async () => {
  try {
    await messagesStore.fetchMessageDetail(props.messageId)
    await messagesStore.fetchRecipients(props.messageId)
  } catch (error) {
    console.error('Error fetching message details:', error)
  }
})
</script>
