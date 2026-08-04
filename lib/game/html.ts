/** HTML helpers for safe export / display. */

/** Escape text for safe insertion into HTML. */
export function escapeHtml(input: string): string {
  if (!input) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Escape raw text, then apply light markdown (**bold**, *italic*, newlines).
 * Safe for storybook export — user/assistant content cannot inject tags.
 */
export function formatMessageHtmlSafe(content: string): string {
  if (!content) return ''
  const escaped = escapeHtml(content)
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}
