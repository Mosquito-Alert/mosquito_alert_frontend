export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

export function getLanguageName(localeCode: string): string | undefined {
  // Create a DisplayNames instance for languages, using English as the display language
  const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })

  // The locale code might be something like 'fr-FR' or 'es-ES',
  // but Intl.DisplayNames expects just the language part like 'fr', so extract that
  const languageCode = localeCode.split('-')[0]

  return displayNames.of(languageCode)
}
