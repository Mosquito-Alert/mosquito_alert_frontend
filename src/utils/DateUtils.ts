export function formatLocalDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('default', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
