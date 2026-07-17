import type { LocalizedMessageBodyRequest, LocalizedMessageTitleRequest } from 'mosquito-alert'

export type LanguageKey = keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest
