/** Safe JSON parse with markdown fence cleanup. */
export function safeParseJSON(text: string, context = 'json'): any | null {
  if (!text || typeof text !== 'string') {
    console.warn(`[${context}] Empty text for JSON parsing`)
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    try {
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      return JSON.parse(cleaned)
    } catch {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) return JSON.parse(jsonMatch[0])
      } catch {
        // fall through
      }
      console.warn(`[${context}] Failed to parse JSON: ${text.substring(0, 200)}`)
      return null
    }
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
