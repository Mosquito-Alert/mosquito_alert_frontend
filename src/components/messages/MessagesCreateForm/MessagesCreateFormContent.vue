<template>
  <div class="flex flex-col gap-4 mt-4">
    <div class="flex gap-1">
      <FloatLabel variant="on">
        <InputText
          v-if="messagesStore.selectedLanguage"
          v-model="messagesStore.subjectByLanguage[messagesStore.selectedLanguage]"
          type="text"
          fluid
          :lang="messagesStore.selectedLanguage"
          :invalid="!messagesStore.isSubjectComplete(messagesStore.selectedLanguage)"
        />
        <label for="subject">Subject</label>
      </FloatLabel>
    </div>
    <Editor
      v-if="messagesStore.selectedLanguage"
      v-model="messagesStore.bodyByLanguage[messagesStore.selectedLanguage]"
      :invalid="!messagesStore.isBodyComplete(messagesStore.selectedLanguage)"
      editorStyle="height: 320px"
    />
    <Button
      class="ml-auto"
      :disabled="!messagesStore.canSubmit"
      severity="primary"
      label="Send"
      icon="pi pi-send"
      @click="handleSend"
    />
  </div>
</template>
<script setup lang="ts">
import { MessageTarget } from 'mosquito-alert'
import { useToast } from 'primevue'
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import { watch } from 'vue'
import { messagesApi } from '../../../services/apiService'
import { useMessagesStore } from '../../../stores/messagesStore'
import type { LanguageKey } from '../../../types/types'

const messagesStore = useMessagesStore()

const toast = useToast()

// *  Props & emits */
const emit = defineEmits(['onMessageSent'])
const props = defineProps<{
  dialogRef: DynamicDialogInstance | undefined
}>()

async function handleSend() {
  try {
    if (messagesStore.target === MessageTarget.Users) {
      await messagesApi.create({
        metaCreateMessageRequest: {
          target: MessageTarget.Users,
          user_uuids: messagesStore.userRecipients?.map((user) => user.uuid) || [],
          content: {
            title: messagesStore.subjectByLanguage,
            body: messagesStore.bodyByLanguage,
          },
        },
      })
    }
    // else if (selectedFormType.value === 'audience' && topicRecipient.value) {
    //   await messagesApi.create({
    //     metaCreateMessageRequest: {
    //       target: CreateAudienceMessageRequestTarget.Audience,
    //       content: {
    //         title: subjectByLanguage.value as LocalizedAudienceMessageTitleRequest,
    //         body: bodyByLanguage.value as LocalizedAudienceMessageBodyRequest,
    //       },
    //       audience: {},
    //     },
    //   })
    // }
    toast.add({
      severity: 'success',
      summary: 'Message sent',
      detail: 'Your message has been sent successfully.',
      life: 3000,
    })
    // Emit event to parent to refresh message list
    emit('onMessageSent')
    // Close dialog
    props.dialogRef?.close()
  } catch (error) {
    console.error('Error sending message:', error)
    toast.add({
      severity: 'error',
      summary: 'Message not sent',
      detail: 'There was an error sending your message.',
      life: 3000,
    })
  }
}

// Initialize message storage for new languages
watch(
  () => messagesStore.requiredLanguages,
  (newLanguages, oldLanguages) => {
    // Initialize empty messages for new languages
    if (messagesStore.target === MessageTarget.Users) {
      newLanguages.forEach((lang: LanguageKey) => {
        if (!messagesStore.subjectByLanguage[lang]) {
          messagesStore.subjectByLanguage[lang] = undefined
        }
        if (!messagesStore.bodyByLanguage[lang]) {
          messagesStore.bodyByLanguage[lang] = undefined
        }
      })

      // Delete messages for removed languages
      if (oldLanguages) {
        oldLanguages.forEach((lang: LanguageKey) => {
          if (!newLanguages.includes(lang)) {
            delete messagesStore.subjectByLanguage[lang]
            delete messagesStore.bodyByLanguage[lang]
          }
        })
      }
    }
    //  else {
    //   TOPIC_LANGUAGES.forEach((lang: LanguageKey) => {
    //     if (!messagesStore.subjectByLanguage[lang]) {
    //       messagesStore.subjectByLanguage[lang] = undefined
    //     }
    //     if (!messagesStore.bodyByLanguage[lang]) {
    //       messagesStore.bodyByLanguage[lang] = undefined
    //     }
    //   })
    // }

    // Set first language as selected if none selected
    if (!messagesStore.selectedLanguage && newLanguages.length > 0) {
      messagesStore.selectedLanguage = newLanguages[0] as LanguageKey
    }

    // If current language is no longer available, switch to first available
    if (
      messagesStore.selectedLanguage &&
      !newLanguages.includes(messagesStore.selectedLanguage) &&
      newLanguages.length > 0
    ) {
      messagesStore.selectedLanguage = newLanguages[0] as LanguageKey
    }
  },
  {
    immediate: true,
  },
)
</script>
