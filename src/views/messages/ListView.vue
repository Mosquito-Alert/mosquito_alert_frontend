<template>
  <div class="card">
    <!-- Header panel + filter panel -->
    <div class="flex flex-col py-4 gap-4">
      <div class="flex flex-row">
        <div class="flex gap-2">
          <h4 class="m-0!">Sent messages</h4>
          <Button v-if="$can('add', 'Message')" icon="pi pi-plus" label="New" @click="showSendMessageDialog = true" />
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <Button :icon="showFilters ? 'pi pi-filter-fill' : 'pi pi-filter'" variant="outlined"
            :severity="showFilters ? 'contrast' : 'secondary'" @click="showFilters = !showFilters"
            v-tooltip.top="'Show/hide filter panel'" />
          <Divider layout="vertical" class="my-0" />
          <Button icon="pi pi-refresh" :loading="loading" severity="secondary" @click="fetchData" variant="outlined" />
        </div>
      </div>
      <Panel v-show="showFilters" header="Filters" class="mb-4" :pt="{
        content: {
          class: 'flex flex-wrap items-center gap-2'
        },
      }">
        <FloatLabel variant="on">
          <UserAutocomplete id="recipients_filter" v-model="recipients" multiple />
          <label for="recipients_filter">Recipients</label>
        </FloatLabel>
        <Button icon="pi pi-filter-slash" label="Clear" @click="clearFilters" />
      </Panel>
    </div>

    <MessagesDataTable :messages="messages" :loading="loading" :messagesTotalCount="messagesTotalCount"
      @pageChange="onPageChange" @refresh="fetchData" />

  </div>

  <Dialog v-model:visible="showSendMessageDialog" modal header="Send message">
    <MessagesCreateForm />
  </Dialog>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'


import { messagesApi } from '@/services/apiService'

import type { Message, MessagesApiListMineSentRequest, User } from 'mosquito-alert'
import { MessagesListMineSentOrderByParameter } from 'mosquito-alert'
import MessagesDataTable from '@/components/messages/MessagesDataTable.vue'
import type { DataTablePageEvent } from 'primevue'
import UserAutocomplete from '@/components/users/UserAutocomplete.vue'
import MessagesCreateForm from '@/components/messages/MessagesCreateForm.vue'


const pageSelected = ref<number>(0);
const messagesTotalCount = ref<number>(0);
const messages = ref<Message[]>([])
const loading = ref<boolean>(false);
const recipients = ref<User[] | null>(null);

const numRows = ref<number>(25);
const onPageChange = (event: DataTablePageEvent) => {
  pageSelected.value = event.page
}
const showFilters = ref<boolean>(false);

const showSendMessageDialog = ref<boolean>(false);

onMounted(async () => {
  await fetchData()
})

const clearFilters = () => {
  recipients.value = null
}

const listRequest = computed<MessagesApiListMineSentRequest>(() => ({
  orderBy: [MessagesListMineSentOrderByParameter.MinusCreatedAt],
  page: pageSelected.value + 1,
  pageSize: numRows.value,
  recipientUuids: recipients.value ? recipients.value.map((r: User) => r.uuid) : undefined
}))

watch(listRequest, async () => {
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const response = await messagesApi.listMineSent(listRequest.value)
    messages.value = response.data.results
    messagesTotalCount.value = response.data.count
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    loading.value = false
  }
}



</script>
