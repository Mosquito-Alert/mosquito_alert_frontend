<template>
  <div class="card">
    <!-- Header panel + filter panel -->
    <div class="flex flex-col py-4 gap-4">
      <div class="flex flex-row">
        <div class="flex gap-2">
          <h4 class="m-0!">Sent messages</h4>
          <Button
            v-if="$can('add', 'Message')"
            icon="pi pi-plus"
            label="New"
            @click="showSendMessageDialog = true"
          />
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <Button
            :icon="showFilters ? 'pi pi-filter-fill' : 'pi pi-filter'"
            variant="outlined"
            :severity="showFilters ? 'contrast' : 'secondary'"
            @click="showFilters = !showFilters"
            v-tooltip.top="'Show/hide filter panel'"
          />
          <Divider layout="vertical" class="my-0" />
          <Button
            icon="pi pi-refresh"
            :loading="messagesStore.loadingMessages"
            severity="secondary"
            @click="messagesStore.fetchMessages"
            variant="outlined"
          />
        </div>
      </div>
      <Panel
        v-show="showFilters"
        header="Filters"
        class="mb-4"
        :pt="{
          content: {
            class: 'flex flex-wrap items-center gap-2',
          },
        }"
      >
        <FloatLabel variant="on">
          <UserAutocomplete
            id="recipients_filter"
            v-model="messagesStore.userRecipients"
            multiple
          />
          <label for="recipients_filter">Recipients</label>
        </FloatLabel>
        <Button icon="pi pi-filter-slash" label="Clear" @click="clearFilters" />
      </Panel>
    </div>

    <MessagesDataTable />
  </div>

  <Dialog v-model:visible="showSendMessageDialog" modal header="Send message">
    <MessagesCreateForm
      @onMessageSent="
        () => {
          showSendMessageDialog = false
          messagesStore.fetchMessages()
        }
      "
    />
  </Dialog>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import MessagesCreateForm from '@/components/messages/MessagesCreateForm/MessagesCreateForm.vue'
import MessagesDataTable from '@/components/messages/MessagesDataTable.vue'
import UserAutocomplete from '@/components/users/UserAutocomplete.vue'
import { useMessagesStore } from '../../stores/messagesStore'

const messagesStore = useMessagesStore()

const showFilters = ref<boolean>(false)

const showSendMessageDialog = ref<boolean>(false)

onMounted(async () => {
  await messagesStore.fetchMessages()
})

const clearFilters = () => {
  messagesStore.setRecipients(null)
}

watch(
  () => messagesStore.listRequest,
  async () => {
    await messagesStore.fetchMessages()
  },
  { immediate: true },
)
</script>
