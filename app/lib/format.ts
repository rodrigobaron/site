export function formatDate(
  dateStr: string,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  return new Date(dateStr).toLocaleDateString('en-US', opts)
}
