<template>
  <div class="flex flex-col gap-4 w-full p-2">
    <div class="flex pt-2 gap-2">
      <div class="flex flex-row w-full items-center gap-2">
        <InputGroup>
          <InputGroupAddon>
            <Button :icon="formTypeOptions.find(option => option.value === selectedFormType)?.icon" severity="secondary"
              variant="text" @click="toggleFormTypeMenu" :disabled="disableRecipientSelect" />
          </InputGroupAddon>
          <FloatLabel variant="on">
            <UserAutocomplete v-if="selectedFormType === 'user'" v-model="userRecipients"
              :disabled="disableRecipientSelect" multiple class="[&>*]:rounded-l-none!" />
            <MessageTopicAutocomplete v-else v-model="topicRecipient" class="[&>*]:rounded-l-none!" />
            <label>
              {{formTypeOptions.find(option => option.value === selectedFormType)?.placeholder}}
            </label>
          </FloatLabel>
        </InputGroup>
        <Menu ref="formTypeMenuRef" :model="formTypeOptions" popup class="!min-w-fit" />

        <InputGroup v-if="hasRecipient && availableLanguages.length > 0" class="w-64!">
          <InputGroupAddon>
            <i class="pi pi-language" />
          </InputGroupAddon>
          <Select :options="availableLanguages.sort((a, b) =>
            getLanguageName(a).localeCompare(getLanguageName(b))
          )" v-model="selectedLanguage">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex gap-2 items-center">
                <span :class="languageIsRequired(slotProps.value) ? 'font-bold' : ''">{{
                  getLanguageName(slotProps.value) ?? slotProps.value }}</span>
                <div v-if="languageIsRequired(slotProps.value)">
                  <i v-if="!isLanguageComplete(slotProps.value)" class="pi pi-times-circle text-red-500" />
                  <i v-else class="pi pi-check-circle text-green-500" />
                </div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex gap-2 items-center">
                <span :class="languageIsRequired(slotProps.option) ? 'font-bold' : ''">
                  {{ getLanguageName(slotProps.option) }}
                </span>
                <div v-if="languageIsRequired(slotProps.option)">
                  <i v-if="!isLanguageComplete(slotProps.option)" class="pi pi-times-circle text-red-500" />
                  <i v-else class="pi pi-check-circle text-green-500" />
                </div>
              </div>
            </template>
          </Select>
        </InputGroup>
      </div>
    </div>
    <div v-if="hasRecipient" class="flex flex-col gap-4 mt-4">
      <div class="flex gap-1">
        <FloatLabel variant="on">
          <InputText v-if="selectedLanguage" v-model="subjectByLanguage[selectedLanguage]" type="text" fluid
            :lang="selectedLanguage" :invalid="!isSubjectComplete(selectedLanguage)" />
          <label for="subject">Subject</label>
        </FloatLabel>
      </div>
      <Editor v-if="selectedLanguage" v-model="bodyByLanguage[selectedLanguage]"
        :invalid="!isBodyComplete(selectedLanguage)" editorStyle="height: 320px" />
      <Button class="ml-auto" :disabled="!canSubmit" severity="primary" label="Send" icon="pi pi-send"
        @click="handleSend" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, watch, onMounted, inject, type ComputedRef } from 'vue';
import { useToast } from 'primevue';
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'

import type { LocalizedMessageBodyRequest, LocalizedMessageTitleRequest, LocalizedTopicMessageBodyRequest, LocalizedTopicMessageTitleRequest, MessageTopic, User } from 'mosquito-alert';

import { messagesApi } from '@/services/apiService';
import { getLanguageName } from '@/utils/Utils';
import UserAutocomplete from '../users/UserAutocomplete.vue';
import MessageTopicAutocomplete from './MessageTopicAutocomplete.vue';

const TOPIC_LANGUAGES = ['bg', 'bn', 'ca', 'de', 'el', 'en', 'es', 'eu', 'fr', 'gl', 'hr', 'hu', 'it', 'lb', 'mk', 'nl', 'pt', 'ro', 'sl', 'sq', 'sr', 'sv', 'tr', 'zh-CN'] as const satisfies ReadonlyArray<keyof LocalizedTopicMessageTitleRequest>;

const toast = useToast();

// Store messages per language
const userRecipients = ref<User[] | null>(null);
const topicRecipient = ref<MessageTopic | null>(null);
const disableRecipientSelect = ref<boolean>(false);

const hasRecipient = computed(() => {
  return !!userRecipients.value || !!topicRecipient.value;
});

const dialogRef = inject<ComputedRef<DynamicDialogInstance>>('dialogRef');
onMounted(() => {
  const params = dialogRef?.value?.data;
  if (params?.initialRecipients) {
    userRecipients.value = params.initialRecipients;
  }
  if (params?.disableRecipientSelect) {
    disableRecipientSelect.value = true;
  }
})

const bodyByLanguage = ref<Record<keyof LocalizedMessageBodyRequest | keyof LocalizedTopicMessageBodyRequest, string | undefined>>({} as Record<keyof LocalizedMessageBodyRequest, string | undefined>);
const subjectByLanguage = ref<Record<keyof LocalizedMessageTitleRequest | keyof LocalizedTopicMessageTitleRequest, string | undefined>>({} as Record<keyof LocalizedMessageTitleRequest | keyof LocalizedTopicMessageTitleRequest, string | undefined>);

const formTypeMenuRef = ref();
const formTypeOptions = [
  { label: 'User', value: 'user', icon: 'pi pi-user', placeholder: 'Recipients', command: () => { selectedFormType.value = 'user'; } },
  { label: 'Topic', value: 'topic', icon: 'pi pi-megaphone', placeholder: 'Topic', command: () => { selectedFormType.value = 'topic'; } },
];
const selectedFormType = ref<'user' | 'topic'>('user');
watch(selectedFormType, () => {
  // Clear recipients when form type changes
  userRecipients.value = null;
  // Clear topic when form type changes
  topicRecipient.value = null;
  subjectByLanguage.value = {} as Record<keyof LocalizedMessageTitleRequest | keyof LocalizedTopicMessageTitleRequest, string | undefined>;
  bodyByLanguage.value = {} as Record<keyof LocalizedMessageBodyRequest, string | undefined>;
});

const toggleFormTypeMenu = (event: PointerEvent) => {
  formTypeMenuRef.value.toggle(event);
};

const languageIsRequired = (lang: keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest | string) => {
  return requiredLanguages.value.includes(lang as keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest);
};

const requiredLanguages = computed(() => {
  const languages = new Set<keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest>();
  if (selectedFormType.value === 'user' && userRecipients.value) {
    userRecipients.value.forEach((recipient) => {
      if (recipient.locale) {
        languages.add(recipient.locale as keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest);
      }
    });
  } else if (selectedFormType.value === 'topic' && topicRecipient.value) {
    // Assuming topicRecipient has a 'locales' property which is an array of locales relevant to the topic
    languages.add('en' as keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest);
  }
  return Array.from(languages);
})
const selectedLanguage = ref<keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest | null>(null);

// Initialize message storage for new languages
watch(requiredLanguages, (newLanguages, oldLanguages,) => {
  // Initialize empty messages for new languages
  if (selectedFormType.value === 'user') {
    newLanguages.forEach((lang) => {
      if (!subjectByLanguage.value[lang]) {
        subjectByLanguage.value[lang] = undefined;
      }
      if (!bodyByLanguage.value[lang]) {
        bodyByLanguage.value[lang] = undefined;
      }
    });

    // Delete messages for removed languages
    oldLanguages.forEach((lang) => {
      if (!newLanguages.includes(lang)) {
        delete subjectByLanguage.value[lang];
        delete bodyByLanguage.value[lang];
      }
    });
  } else {
    TOPIC_LANGUAGES.forEach((lang) => {
      if (!subjectByLanguage.value[lang]) {
        subjectByLanguage.value[lang] = undefined;
      }
      if (!bodyByLanguage.value[lang]) {
        bodyByLanguage.value[lang] = undefined;
      }
    });
  }

  // Set first language as selected if none selected
  if (!selectedLanguage.value && newLanguages.length > 0) {
    selectedLanguage.value = newLanguages[0] as keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest;
  }

  // If current language is no longer available, switch to first available
  if (selectedLanguage.value && !newLanguages.includes(selectedLanguage.value) && newLanguages.length > 0) {
    selectedLanguage.value = newLanguages[0] as keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest;
  }
});

const availableLanguages = computed(() => {
  const languages = new Set<keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest>();
  for (const lang in subjectByLanguage.value) {
    languages.add(lang as keyof LocalizedMessageTitleRequest);
  }

  for (const lang in bodyByLanguage.value) {
    languages.add(lang as keyof LocalizedMessageBodyRequest);
  }
  return Array.from(languages);
});

const canSubmit = computed(() => {
  if (!hasRecipient.value) {
    return false;
  }

  for (const lang of requiredLanguages.value) {
    if (!isLanguageComplete(lang)) {
      return false;
    }
  }

  return true;
});

// Helper to check if a language has complete content
const isSubjectComplete = (lang: keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest) => {
  const subject = subjectByLanguage.value[lang as keyof LocalizedMessageTitleRequest];
  return subject && subject.trim() !== '';
};

const isBodyComplete = (lang: keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest) => {
  const body = bodyByLanguage.value[lang as keyof LocalizedMessageBodyRequest];
  return body && body.trim() !== '';
};

const isLanguageComplete = (lang: keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest) => {
  return isBodyComplete(lang) && isSubjectComplete(lang);
};

async function handleSend() {
  try {
    if (selectedFormType.value === 'user') {
      await messagesApi.create({
        createUserMessageRequest: {
          user_uuids: userRecipients.value?.map(user => user.uuid) || [],
          content: {
            title: subjectByLanguage.value,
            body: bodyByLanguage.value,
          },
        }
      });
    } else if (selectedFormType.value === 'topic' && topicRecipient.value) {
      await messagesApi.topicsSend({
        code: topicRecipient.value.code,
        createTopicMessageRequest: {
          content: {
            title: subjectByLanguage.value as LocalizedTopicMessageTitleRequest,
            body: bodyByLanguage.value as LocalizedTopicMessageBodyRequest,
          }
        }
      });
    }
    toast.add({ severity: 'success', summary: 'Message sent', detail: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Error sending message:', error);
    toast.add({ severity: 'error', summary: 'Message not sent', detail: 'There was an error sending your message.' });
  }
}

</script>
