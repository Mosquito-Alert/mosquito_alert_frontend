import {
  AudienceFilterLocale,
  MessagesListMineSentOrderByParameter,
  type AudienceFilterRequest,
  type LocalizedAudienceMessageBodyRequest,
  type LocalizedAudienceMessageTitleRequest,
  type LocalizedMessageBodyRequest,
  type LocalizedMessageTitle,
  type LocalizedMessageTitleRequest,
  type Message,
  type MessageRecipient,
  type MessageRecipientStats,
  type MetaCreateMessageRequest,
  type PaginatedMessageRecipientList,
  type User,
} from 'mosquito-alert'
import { MessageTarget } from 'mosquito-alert/models'
import { defineStore } from 'pinia'
import { messagesApi, userApi } from '../services/apiService'
import type { LanguageKey } from '../types/types'

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    messageTargetOptions: [
      { label: 'Specific users', icon: 'pi pi-user', value: MessageTarget.Users },
      { label: 'Filtered audience', icon: 'pi pi-users', value: MessageTarget.Audience },
    ],
    // * ################ List ################
    messages: [] as Message[], // The list of messages
    messagesTotalCount: 0, // The total number of messages
    loadingMessages: false, // Whether the messages are being loaded
    pageSelected: 0, // The selected page for the messages list
    numRows: 25, // The number of rows per page for the messages list
    filterByRecipients: null as User[] | null, // The selected recipients for filtering the messages list
    filterByTarget: null as MessageTarget | null, // The selected target for filtering the messages list
    // * ################ Creation ################
    showSendMessageDialog: false, // Whether the send message dialog is visible
    userRecipients: null as User[] | null, // The selected recipients (users or audience)
    audience: null as AudienceFilterRequest | null, // The selected audience for the message being created
    audienceSelected: false, // Whether an audience has been selected for the message being created
    usersAffectedByAudience: null as number | null, // The number of users affected by the audience filters applied
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
    // * ################ Detail ################
    recipientsPagination: { results: [], count: 0 } as PaginatedMessageRecipientList,
    loadingRecipients: false, // Whether the recipients are being loaded
    recipientsStats: { total: 0, read: 0, unread: 0 } as MessageRecipientStats, // The recipients stats
    messageDetail: null as Message | null, // The message detail
  }),
  getters: {
    // * ################ List ################
    pageListRequest: (state) => ({
      orderBy: [MessagesListMineSentOrderByParameter.MinusCreatedAt],
      page: state.pageSelected + 1,
      pageSize: state.numRows,
      recipientUuids: state.filterByRecipients
        ? state.filterByRecipients.map((r: User) => r.uuid)
        : undefined,
      target: state.filterByTarget ?? undefined,
    }),
    // * ################ Creation ################
    // Check if the message creation form should be shown (i.e., if there are recipients selected)
    showMessageCreationDetails: (state): boolean =>
      (state.userRecipients !== null && state.userRecipients.length > 0) || state.audienceSelected,
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
      const languages = new Set<LanguageKey>()
      if (!state.userRecipients || state.userRecipients.length === 0) {
        languages.add('en' as LanguageKey)
        if (state.audience && state.audience.locale) {
          // TODO: Array of locales
          languages.add(state.audience.locale as LanguageKey)
        }
      } else {
        for (const recipient of state.userRecipients) {
          if (recipient.locale) {
            languages.add(recipient.locale as LanguageKey)
          }
        }
      }
      return Array.from(languages)
    },
    // Get the message request object for creating a new message, based on the current state
    messageRequest: (state): MetaCreateMessageRequest => {
      const req = {
        target: state.target as any, // as MessageTarget,
        content: {
          title: state.subjectByLanguage,
          body: state.bodyByLanguage,
        },
      } as any // as MetaCreateMessageRequest
      if (state.target === MessageTarget.Users) {
        req['user_uuids'] = state.userRecipients
          ? state.userRecipients.map((r: User) => r.uuid as string)
          : []
      } else {
        req['audience'] = state.audience
      }
      return req as MetaCreateMessageRequest
    },
    // * ################ Detail ################
    // Get the list of recipients for the message detail view, based on the current state
    recipients: (state): MessageRecipient[] => state.recipientsPagination.results,
    recipientsTotalCount: (state): number => state.recipientsStats.total,
    recipientsTotalReadCount: (state): number => state.recipientsStats.read,
    // The selected language for the message detail
    messageDetailSelectedLanguage: (state): keyof LocalizedMessageTitle => {
      const titles = state.messageDetail?.content?.title
      if (!titles) {
        return 'en' as keyof LocalizedMessageTitle
      }
      return (
        (Object.keys(titles).find(
          (key) => titles[key as keyof typeof titles],
        ) as keyof LocalizedMessageTitle) ?? ('en' as keyof LocalizedMessageTitle)
      )
    },
    // The available languages for the message detail, based on the message content
    messageDetailAvailableLanguages: (state): (keyof LocalizedMessageTitle)[] => {
      const titles = state.messageDetail?.content?.title
      if (!titles) {
        return []
      }
      return (Object.keys(titles) as (keyof LocalizedMessageTitle)[]).filter((key) => titles[key])
    },
  },
  actions: {
    // * ################ List ################
    async fetchMessages() {
      this.loadingMessages = true
      try {
        const response = await messagesApi.listMineSent(this.pageListRequest)
        console.log(response.data)
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
    clearFilters() {
      this.filterByRecipients = null
      this.filterByTarget = null
    },
    // * ################ Creation ################
    // Set the selected recipients (users or audience)
    setRecipients(recipients: User[] | null) {
      this.userRecipients = recipients
    },
    // Set the selected audience for the message being created
    setAudience({
      geometry,
      daysSinceLastLogin,
      locale,
    }: {
      geometry: any
      daysSinceLastLogin: number | null
      locale: AudienceFilterLocale | null
    }) {
      this.audience = {} as AudienceFilterRequest
      if (geometry) {
        this.audience.in_area = geometry
      }
      if (daysSinceLastLogin) {
        const date = new Date()
        date.setDate(date.getDate() - daysSinceLastLogin)
        this.audience.last_login_after = date.toISOString()
      }
      if (locale) {
        this.audience.locale = locale
      }
    },
    clearAudience() {
      this.audience = null
      this.audienceSelected = false
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
    // Check if a given language is required for the message being created (i.e., if it is in the list of required languages)
    isLanguageRequired(lang: LanguageKey) {
      return this.requiredLanguages.includes(lang)
    },
    // Fetch the list of users based on the selected audience filters (geometry, last login, and locale)
    // ? Should I move this to the user store? It is related to users, but it is used in the context of message creation
    async fetchUsersByAudience() {
      if (!this.audience || Object.keys(this.audience).length === 0) {
        this.usersAffectedByAudience = null
        return
      }
      try {
        const response = await userApi.audienceFilter({
          page: 1,
          pageSize: 1,
          audienceFilterRequest: this.audience,
        })
        this.usersAffectedByAudience = response.data.count
      } catch (error) {
        console.error('Error fetching users by audience:', error)
        this.usersAffectedByAudience = null
      }
    },
    // Check if the message can be submitted (i.e., if there are recipients selected and all required languages are complete)
    canSubmit() {
      if (
        !this.showMessageCreationDetails ||
        // If the target is users, check if there are user recipients selected
        (this.target === MessageTarget.Users &&
          (!this.userRecipients || this.userRecipients.length === 0)) ||
        // If the target is audience, check if an audience has been selected
        (this.target === MessageTarget.Audience && (!this.audienceSelected || !this.audience))
      ) {
        return false
      }

      for (const lang of this.requiredLanguages) {
        if (!this.isLanguageComplete(lang)) {
          return false
        }
      }

      return true
    },
    onMessageSent() {
      this.showSendMessageDialog = false
      this.setRecipients(null)
      this.clearAudience()
      this.fetchMessages()
    },
    // * ################ Detail ################
    async fetchMessageDetail(messageUuid: number) {
      try {
        const response = await messagesApi.retrieve({ id: messageUuid })
        this.messageDetail = response.data
      } catch (error) {
        console.error('Error fetching message detail:', error)
      }
    },
    async fetchRecipients(messageUuid: number, page?: number, pageSize?: number) {
      this.loadingRecipients = true
      try {
        const responseRecipients = await messagesApi.recipientsList({
          id: messageUuid,
          page: page ?? 1,
          pageSize: pageSize ?? 25,
        })
        this.recipientsPagination = responseRecipients.data
        const responseStats = await messagesApi.recipientsStatsRetrieve({ id: messageUuid })
        this.recipientsStats = responseStats.data
      } catch (error) {
        console.error('Error fetching recipients:', error)
      } finally {
        this.loadingRecipients = false
      }
    },
  },
})
