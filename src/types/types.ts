import type { LocalizedMessageBodyRequest, LocalizedMessageTitleRequest } from 'mosquito-alert'

export type LanguageKey = keyof LocalizedMessageBodyRequest | keyof LocalizedMessageTitleRequest

export enum ChipMessageKey {
  GEOMETRY = 'geometry',
  LAST_LOGIN = 'lastLogin',
  LOCALE_PREFIX = 'locale:',
  TAG_PREFIX = 'tag:',
}
