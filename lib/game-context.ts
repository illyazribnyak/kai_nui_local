import fs from 'fs'
import path from 'path'
import {
  MODE_LORE_SECTIONS,
  modeInstructions,
  type PromptMode,
} from '@/lib/prompt-mode'

const CORE_MAX = 3500
const SECTION_BUDGET = 9000 // total chars for lore sections per request

let fullCache: string | null = null
let coreCache: string | null = null
let sectionCache: Map<string, string> | null = null

function readSafe(rel: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), rel), 'utf-8')
  } catch (e: any) {
    console.error('Failed to read', rel, e?.message)
    return ''
  }
}

function getCore(): string {
  if (coreCache) return coreCache
  coreCache = readSafe('data/context-core.txt').slice(0, CORE_MAX)
  return coreCache
}

function getFull(): string {
  if (fullCache) return fullCache
  fullCache = readSafe('data/game_context.txt')
  return fullCache
}

/** Split markdown-ish ## sections from full lore. */
function getSections(): Map<string, string> {
  if (sectionCache) return sectionCache
  const map = new Map<string, string>()
  const full = getFull()
  if (!full) {
    sectionCache = map
    return map
  }
  const parts = full.split(/^## /m)
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i]
    const nl = block.indexOf('\n')
    const title = (nl === -1 ? block : block.slice(0, nl)).trim()
    const body = nl === -1 ? '' : block.slice(nl + 1).trim()
    // strip anchor junk from title
    const cleanTitle = title.replace(/\{#.*\}/, '').trim()
    map.set(cleanTitle, body)
  }
  sectionCache = map
  return map
}

function pickSections(titles: string[], budget: number): string {
  const sections = getSections()
  const chunks: string[] = []
  let used = 0
  for (const title of titles) {
    // fuzzy match: exact or includes
    let body = sections.get(title)
    if (!body) {
      for (const [k, v] of sections) {
        if (k.includes(title) || title.includes(k)) {
          body = v
          break
        }
      }
    }
    if (!body) continue
    const slice = body.slice(0, Math.min(3500, budget - used))
    if (!slice) break
    chunks.push(`## ${title}\n${slice}`)
    used += slice.length
    if (used >= budget) break
  }
  return chunks.join('\n\n')
}

/**
 * Layered lore for the LLM:
 * - always: short core rules
 * - mode: relevant full-lore sections (budgeted)
 * - mode instructions
 *
 * Falls back to truncated full file if sections missing.
 */
export function getGameContext(mode: PromptMode = 'adventure'): string {
  const core = getCore()
  const titles = MODE_LORE_SECTIONS[mode] || MODE_LORE_SECTIONS.adventure
  let lore = pickSections(titles, SECTION_BUDGET)

  if (!lore) {
    // fallback: first N chars of full context
    lore = getFull().slice(0, SECTION_BUDGET)
  }

  return [
    core,
    '',
    modeInstructions(mode),
    '',
    '# === LORE (mode-selected excerpts) ===',
    lore,
  ]
    .filter(Boolean)
    .join('\n')
}

/** Legacy helper — default adventure context. */
export function getFullGameContextUncapped(): string {
  return getFull()
}
