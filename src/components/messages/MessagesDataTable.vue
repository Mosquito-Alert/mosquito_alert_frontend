<template>
  <div class="flex-1 h-full overflow-hidden flex border border-surface rounded-2xl">
    <DataTable :value="messages" dataKey='id' :loading="loading" v-model:rows="numRows"
      :total-records="messagesTotalCount" lazy paginator :rowsPerPageOptions="[5, 10, 25, 50]"
      @page="$emit('page', $event)"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="({totalRecords} items)" tableStyle="min-width: 50rem" selectionMode="single"
      @rowSelect="handleRowSelect" :pt="{
        root: {
          class: 'w-full flex-1 overflow-x-auto'
        },
        thead: {
          class: 'hidden'
        },
        header: {
          class: 'sticky top-0 z-10'
        }
      }">
      <Column field="title" style="min-width: 14rem; max-width: 40rem">
        <template #body="{ data }">
          <div class="truncate">
            <span class="text-color leading-6 mr-2">{{ getTitle(data) }}</span>
            <span class="text-muted-color leading-5 text-sm">{{ getBody(data) }}</span>
          </div>
        </template>
      </Column>
      <Column field="name">
        <template #body="{ data }">
          <div class="flex items-center">
            <UserAvatar :user="data.sender_user" />
            <div class="ml-4 leading-6 text-color font-medium">
              {{ data.sender_user.full_name || data.sender_user.username }}
            </div>
          </div>
        </template>
      </Column>
      <Column field="created_at">
        <template #body="{ data }">
          <div class="text-sm leading-5 text-muted-color">{{ formatLocalDateTime(data.created_at) }}</div>
        </template>
      </Column>
    </DataTable>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { DataTablePageEvent, DataTableRowSelectEvent } from 'primevue'
import { htmlToText } from 'html-to-text'
import { useRouter } from 'vue-router'

import type { Message } from 'mosquito-alert'
import { formatLocalDateTime } from '@/utils/DateUtils'
import UserAvatar from '@/components/users/UserAvatar.vue'

defineProps<{
  messages?: Message[],
  loading: boolean,
  messagesTotalCount: number
}>()

defineEmits<{
  (e: 'page', event: DataTablePageEvent): void,
}>()

const router = useRouter()
const numRows = ref<number>(25)

function getTitle(message: Message) {
  const titles = message.content?.title
  if (!titles) return 'No title'

  if (titles.en) return titles.en

  const firstAvailable = Object.values(titles).find(Boolean)
  return firstAvailable || 'No title'
}

function getBody(message: Message) {
  const bodies = message.content?.body
  if (!bodies) return 'No content'

  const html = bodies.en || Object.values(bodies).find(Boolean)
  if (!html) return 'No content'

  return htmlToText(html, { wordwrap: false })
}

function handleRowSelect(event: DataTableRowSelectEvent<Message>) {
  const messageId = event.data.id;
  // Navigate to the detail view for the selected message
  router.push({ name: 'message_detail', params: { messageId } });
}
</script>
