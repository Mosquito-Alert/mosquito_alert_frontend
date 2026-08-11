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
            <span v-if="!messagesStore.loadingMessageDetail" class="text-muted-color">
              ({{ messagesStore.recipientsTotalReadCount }} reads of
              {{ messagesStore.recipientsTotalCount }})
            </span>
            :
          </span>
          <div class="flex flex-1 flex-wrap gap-2 overflow-auto max-h-48">
            <Skeleton v-if="messagesStore.loadingMessageDetail" />
            <VirtualScroller
              v-else
              :items="recipients"
              :itemSize="itemSize"
              :loading="messagesStore.loadingRecipients"
              @scroll="onScroll"
              class="border border-surface-200 dark:border-surface-700 rounded w-full h-48!"
            >
              <template v-slot:item="{ item }">
                <Skeleton v-if="!item" height="40px" class="m-1" />
                <MessageRecipientChip
                  v-else
                  :user="item.user"
                  :has_read="item.has_read"
                  class="m-0.5"
                />
              </template>
              <template v-slot:loader>
                <Skeleton height="40px" class="m-1" />
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
        {{ getTitle() }}
      </h2>
      <div v-html="getBody()"></div>
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
import { onMounted, ref } from 'vue'
import { useMessagesStore } from '../../stores/messagesStore'
import type { MessageRecipient } from 'mosquito-alert'

const messagesStore = useMessagesStore()

// * Props
const props = defineProps<{
  messageId: number
}>()

// * State
const recipients = ref<MessageRecipient[]>([])

const pageSize = 25
const itemSize = 50
const loadingPages = new Set<number>()

// * Methods
const getTitle = () =>
  messagesStore.messageDetail?.content?.title?.[messagesStore.messageDetailSelectedLanguage] ||
  'No title'

const getBody = () =>
  messagesStore.messageDetail?.content?.body?.[messagesStore.messageDetailSelectedLanguage] ||
  'No content'

// Load a specific page of recipients, ensuring that we don't load the same page multiple times and that we respect the pagination limits.
const loadPage = async (page: number) => {
  if (loadingPages.has(page)) return
  if (messagesStore.recipientsPagination?.next === null && page > 1) return
  loadingPages.add(page)
  try {
    await messagesStore.fetchRecipients({ messageUuid: props.messageId, page, pageSize })
    recipients.value.splice((page - 1) * pageSize, pageSize, ...messagesStore.recipients)
  } catch (error) {
    console.error('Error fetching recipients:', error)
  } finally {
    loadingPages.delete(page)
  }
}

// Handle the scroll event to determine if we need to load more recipients based on the user's scroll position and the number of recipients already loaded.
const onScroll = (event: Event) => {
  const el = event.target as HTMLElement
  if (!el) return
  const loadedCount = recipients.value.filter(Boolean).length
  if (loadedCount >= messagesStore.recipientsTotalCount) return
  const loadedHeight = loadedCount * itemSize
  const nearLoadedEnd = el.scrollTop + el.clientHeight >= loadedHeight - itemSize * 3
  if (!nearLoadedEnd) return
  loadPage(Math.floor(loadedCount / pageSize) + 1)
}

onMounted(async () => {
  try {
    await messagesStore.fetchMessageDetail(props.messageId)
    recipients.value = Array.from({ length: messagesStore.recipientsStats.total })
    await loadPage(1)
  } catch (error) {
    console.error('Error fetching message details:', error)
  }
})
</script>
