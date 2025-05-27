export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join('')
}
