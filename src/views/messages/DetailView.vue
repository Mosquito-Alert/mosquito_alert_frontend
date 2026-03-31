<template>
  <div class="card">
    <div class="flex">
      <div class="flex flex-1 flex-col gap-4">
        <div class="flex items-center gap-2">
          <span>From:</span>
          <div v-if="message" class="flex items-center">
            <UserAvatar :user="message.sender_user" />
            <div class="ml-2 leading-6 text-color font-medium">
              {{ message.sender_user.full_name || message.sender_user.username }}
            </div>
          </div>
          <Skeleton v-else />
          <div class="ml-auto">
            <InputGroup>
              <InputGroupAddon>
                <i class="pi pi-language" />
              </InputGroupAddon>
              <Select :options="availableLanguages" v-model="selectedLanguage"
                :optionLabel="(value) => getLanguageName(value)" />
            </InputGroup>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span>To
            <span v-if="!loadingRecipients" class="text-muted-color">
              ({{ recipientsTotalReadCount }} reads of {{ recipientsTotalCount }})
            </span>
            :
          </span>
          <div class="flex flex-1 overflow-y">
            <Skeleton v-if="loadingRecipients" />
            <MessageRecipientChip v-else-if="recipientsTotalCount < 100" v-for="recipient in recipients"
              :key="recipient.user.uuid" :user="recipient.user" :has_read="recipient.has_read" />
            <VirtualScroller v-else :items="recipients" :itemSize="50"
              class="border border-surface-200 dark:border-surface-700 rounded w-full" style="height: 200px">
              <template v-slot:item="{ item }">
                <MessageRecipientChip :user="item.user" :has_read="item.has_read" />
              </template>
            </VirtualScroller>
          </div>
          <div class=" flex ml-auto">
            <div class="flex ml-auto">
              <span v-if="message" class="text-muted-color">{{ formatLocalDateTime(message.created_at) }}</span>
              <Skeleton v-else />
            </div>
          </div>
        </div>

      </div>
    </div>
    <Divider />
    <div v-if="message">
      <h2 class="text-2xl font-bold mb-4">{{ getTitle(message, selectedLanguage) }}</h2>
      <div v-html="getBody(message, selectedLanguage)"></div>
    </div>
    <div v-else class="flex items-center justify-center h-full w-full py-10">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { messagesApi } from '@/services/apiService';
import type { Message, MessageRecipient, LocalizedMessageTitle } from 'mosquito-alert';
import { getLanguageName } from '@/utils/Utils';
import UserAvatar from '@/components/users/UserAvatar.vue';
import { formatLocalDateTime } from '@/utils/DateUtils';
import MessageRecipientChip from '@/components/messages/MessageRecipientChip.vue';

const props = defineProps<{
  messageId: number,
}>()

const message = ref<Message | null>(null);

const recipients = ref<MessageRecipient[]>([]);

const recipientsTotalCount = computed(() => recipients.value.length);
const recipientsTotalReadCount = computed(() => recipients.value.filter(r => r.has_read).length);

const loadingRecipients = ref<boolean>(true);
const selectedLanguage = ref<keyof LocalizedMessageTitle>('en');
const availableLanguages = ref<(keyof LocalizedMessageTitle)[]>([]);

function getTitle(message: Message, language: keyof LocalizedMessageTitle) {
  return message.content?.title?.[language] || 'No title';
}

function getBody(message: Message, language: keyof LocalizedMessageTitle) {
  return message.content?.body?.[language] || 'No content';
}

onMounted(async () => {
  try {
    const response = await messagesApi.retrieve({ id: props.messageId });
    const titles = response.data.content?.title;
    selectedLanguage.value = titles
      ? (Object.keys(titles).find(
        key => titles[key as keyof typeof titles]
      ) as keyof LocalizedMessageTitle) ?? 'en'
      : 'en';
    availableLanguages.value = titles
      ? (Object.keys(titles) as (keyof LocalizedMessageTitle)[])
        .filter((key) => titles[key])
      : [];
    message.value = response.data;

    const recipientsResponse = await messagesApi.recipientsList({ id: props.messageId });
    recipients.value = recipientsResponse.data;
  } catch (error) {
    console.error('Error fetching message details:', error);
  }
  await fetchRecipients();
});

async function fetchRecipients() {
  loadingRecipients.value = true;

  messagesApi.recipientsList({ id: props.messageId }).then((response) => {
    recipients.value = response.data;
  }).catch((error) => {
    console.error('Error fetching message recipients:', error);
  }).finally(() => {
    loadingRecipients.value = false;
  });
}
</script>
