import { ChipMessageKey, type LanguageKey } from '../types/types'
import { getLanguageName } from './Utils'

export const locales: LanguageKey[] = [
  'en',
  'es',
  'ca',
  'eu',
  'bn',
  'sv',
  'de',
  'sq',
  'el',
  'gl',
  'hu',
  'pt',
  'sl',
  'it',
  'fr',
  'bg',
  'ro',
  'hr',
  'mk',
  'sr',
  'lb',
  'nl',
  'tr',
  'zh-cn',
]

export const localeOptions: { label: string; value: LanguageKey }[] = locales.map((locale) => ({
  label: getLanguageName(locale),
  value: locale,
}))

export const chipMessageKeyStyles: Record<string, string> = {
  [ChipMessageKey.GEOMETRY]: 'bg-indigo-100! ',
  [ChipMessageKey.LAST_LOGIN]: 'bg-teal-100! ',
  [ChipMessageKey.LOCALE_PREFIX]: 'bg-cyan-100! ',
  [ChipMessageKey.TOPIC_PREFIX]: 'bg-orange-100! ',
}

export const getChipMessageStyle = (chipKey: string): string => {
  return (
    chipMessageKeyStyles[chipKey] ||
    chipMessageKeyStyles[
      Object.keys(chipMessageKeyStyles).find((key) => chipKey.startsWith(key)) || ''
    ] ||
    ''
  )
}

export const STATS_REPORTS_TYPES = [
  { key: 'adult', label: 'Adults', color: '#fbc800' },
  { key: 'bite', label: 'Bites', color: '#f44336' },
  { key: 'site', label: 'Breeding sites', color: '#2196f3' },
] as const
