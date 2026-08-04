import type { LanguageKey } from '../types/types'
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
