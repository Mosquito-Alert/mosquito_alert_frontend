import {
  MessagesListMineSentOrderByParameter,
  type LocalizedAudienceMessageBodyRequest,
  type LocalizedAudienceMessageTitleRequest,
  type LocalizedMessageBodyRequest,
  type LocalizedMessageTitleRequest,
  type Message,
  type User,
} from 'mosquito-alert'
import { MessageTarget } from 'mosquito-alert/models'
import { defineStore } from 'pinia'
import type { LanguageKey } from '../types/types'
import { messagesApi } from '../services/apiService'

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    // * ################ List ################
    messages: [] as Message[], // The list of messages
    messagesTotalCount: 0, // The total number of messages
    loadingMessages: false, // Whether the messages are being loaded
    pageSelected: 0, // The selected page for the messages list
    numRows: 25, // The number of rows per page for the messages list
    // * ################ Creation ################
    userRecipients: null as User[] | null, // The selected recipients (users or audience)
    target: MessageTarget.Users as MessageTarget, // The selected target for the message being created
    bodyByLanguage: {} as Record<
      keyof LocalizedMessageBodyRequest | keyof LocalizedAudienceMessageBodyRequest,
      string | undefined
    >, // The message body by language
    subjectByLanguage: {} as Record<
      keyof LocalizedMessageTitleRequest | keyof LocalizedAudienceMessageTitleRequest,
      string | undefined
    >, // The message subject by language
    selectedLanguage: null as LanguageKey | null, // The selected language for the message being created
  }),
  getters: {
    // * ################ List ################
    listRequest: (state) => ({
      orderBy: [MessagesListMineSentOrderByParameter.MinusCreatedAt],
      page: state.pageSelected + 1,
      pageSize: state.numRows,
      recipientUuids: state.userRecipients
        ? state.userRecipients.map((r: User) => r.uuid)
        : undefined,
    }),
    // * ################ Creation ################
    // Check if the message creation form should be shown (i.e., if there are recipients selected)
    showMessageCreationDetails: (state): boolean =>
      state.userRecipients !== null && state.userRecipients.length > 0,
    // Get the list of available languages for the message being created, based on the subject and body by language
    availableLanguages: (state): LanguageKey[] => {
      const languages = new Set<LanguageKey>()
      for (const lang in state.subjectByLanguage) {
        languages.add(lang as keyof LocalizedMessageTitleRequest)
      }

      for (const lang in state.bodyByLanguage) {
        languages.add(lang as keyof LocalizedMessageBodyRequest)
      }
      return Array.from(languages)
    },
    // Get the list of required languages for the message being created, based on the recipients
    requiredLanguages: (state): LanguageKey[] => {
      if (!state.userRecipients || state.userRecipients.length === 0) {
        return []
      }
      const languages = new Set<LanguageKey>()
      for (const recipient of state.userRecipients) {
        if (recipient.locale) {
          languages.add(recipient.locale as LanguageKey)
        }
      }
      return Array.from(languages)
    },
  },
  actions: {
    // * ################ List ################
    async fetchMessages() {
      this.loadingMessages = true
      try {
        const response = await messagesApi.listMineSent(this.listRequest)
        this.messages = response.data.results
        this.messagesTotalCount = response.data.count
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        this.loadingMessages = false
      }
    },
    onPageChange(event: { page: number; rows: number }) {
      this.pageSelected = event.page
      this.numRows = event.rows
    },
    // * ################ Creation ################
    // Set the selected recipients (users or audience)
    setRecipients(recipients: User[] | null) {
      this.userRecipients = recipients
    },
    // Check if the message subject is complete for a given language (i.e., if it is not empty or whitespace)
    isSubjectComplete(lang: LanguageKey) {
      return !!this.subjectByLanguage[lang]?.trim()
    },
    // Check if the message body is complete for a given language (i.e., if it is not empty or whitespace)
    isBodyComplete(lang: LanguageKey) {
      return !!this.bodyByLanguage[lang]?.trim()
    },
    // Check if the message is complete for a given language (i.e., if both the subject and body are complete)
    isLanguageComplete(lang: LanguageKey) {
      return this.isSubjectComplete(lang) && this.isBodyComplete(lang)
    },
    // Check if the message can be submitted (i.e., if there are recipients selected and all required languages are complete)
    canSubmit() {
      if (!this.showMessageCreationDetails) {
        return false
      }

      for (const lang of this.requiredLanguages) {
        if (!this.isLanguageComplete(lang)) {
          return false
        }
      }

      return true
    },
  },
})
