import fs from 'fs'
import path from 'path'

let cachedContext: string | null = null

export function getGameContext(): string {
  if (cachedContext) return cachedContext
  try {
    const filePath = path.join(process.cwd(), 'data', 'game_context.txt')
    cachedContext = fs.readFileSync(filePath, 'utf-8')
    return cachedContext
  } catch (error: any) {
    console.error('Failed to read game context:', error)
    return ''
  }
}
