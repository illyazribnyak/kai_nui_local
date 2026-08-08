/**
 * Unified LLM Client: Supports Gemini 2.0 Flash & DeepSeek Chat with token tracking & fallbacks.
 */

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface AnalyzerResult {
  text: string | null
  usage: TokenUsage
  provider: 'gemini' | 'deepseek' | 'none'
  model: string
}

export interface LLMStreamOptions {
  messages: Array<{ role: string; content: string }>
  provider?: 'auto' | 'gemini' | 'deepseek'
  temperature?: number
  maxTokens?: number
}

export interface LLMStreamResult {
  stream: ReadableStream<Uint8Array>
  provider: 'gemini' | 'deepseek'
  providerLabel: string
  model: string
  getUsage: () => TokenUsage
}

/**
 * Converts standard OpenAI format messages into Gemini REST API format.
 */
export function convertMessagesToGemini(messages: Array<{ role: string; content: string }>) {
  let systemInstructionText = ''
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []

  for (const m of messages) {
    if (!m.content) continue
    if (m.role === 'system') {
      systemInstructionText += (systemInstructionText ? '\n\n' : '') + m.content
    } else {
      const gRole: 'user' | 'model' = m.role === 'user' ? 'user' : 'model'
      const last = contents[contents.length - 1]
      if (last && last.role === gRole) {
        last.parts[0].text += '\n\n' + m.content
      } else {
        contents.push({
          role: gRole,
          parts: [{ text: m.content }],
        })
      }
    }
  }

  // Gemini contents must start with 'user'
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.unshift({ role: 'user', parts: [{ text: '...' }] })
  }

  return {
    systemInstruction: systemInstructionText ? { parts: [{ text: systemInstructionText }] } : undefined,
    contents,
  }
}

/**
 * Estimate tokens if API usage metadata is unavailable.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length / 3.5)
}

/**
 * Gemini model ids to try (2.0-flash is retired for many keys → HTTP 404).
 * Override primary via GEMINI_MODEL=gemini-2.5-flash
 */
export function getGeminiModelCandidates(): string[] {
  const preferred = (process.env.GEMINI_MODEL || '').trim()
  const defaults = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
  ]
  if (preferred) {
    return [preferred, ...defaults.filter((m) => m !== preferred)]
  }
  return defaults
}

/**
 * Call analyzer LLM (Gemini 2.0 Flash with DeepSeek fallback) for JSON extraction or summarization.
 */
export async function callAnalyzerLLM(
  prompt: string,
  options: { maxTokens?: number; temperature?: number; jsonMode?: boolean } = {}
): Promise<AnalyzerResult> {
  const { maxTokens = 2000, temperature = 0.3, jsonMode = false } = options
  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim()

  const emptyUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

  const geminiSafetySettings = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  ]

  // 1. Try Gemini (multiple model ids — 2.0-flash often 404 now)
  if (geminiKey && !geminiKey.includes('встав') && geminiKey.length >= 8) {
    const geminiBody: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature },
      safetySettings: geminiSafetySettings,
    }
    if (jsonMode) geminiBody.generationConfig.responseMimeType = 'application/json'

    for (const model of getGeminiModelCandidates()) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody),
          }
        )

        if (res.ok) {
          const data = await res.json()
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
          const meta = data?.usageMetadata
          const promptTokens = meta?.promptTokenCount ?? estimateTokens(prompt)
          const completionTokens = meta?.candidatesTokenCount ?? estimateTokens(text || '')
          const totalTokens = meta?.totalTokenCount ?? promptTokens + completionTokens

          if (text && text.length > 5) {
            console.log(`[LLM Analyzer] Gemini ${model} succeeded`)
            return {
              text,
              usage: { promptTokens, completionTokens, totalTokens },
              provider: 'gemini',
              model,
            }
          }
        } else {
          console.warn(`[LLM Analyzer] Gemini ${model} HTTP ${res.status}`)
          if (res.status !== 404) break
        }
      } catch (e: any) {
        console.warn(`[LLM Analyzer] Gemini ${model} error:`, e?.message)
      }
    }
    console.warn('[LLM Analyzer] All Gemini models failed → fallback to DeepSeek')
  }

  // 2. Fallback to DeepSeek
  if (deepseekKey && !deepseekKey.includes('встав') && deepseekKey.length >= 8) {
    try {
      const messages: any[] = [{ role: 'user', content: prompt }]
      if (jsonMode) {
        messages.unshift({
          role: 'system',
          content: 'Відповідай ТІЛЬКИ чистим JSON, без markdown, без коментарів, без пояснень.',
        })
      }
      const dsBody: any = {
        model: 'deepseek-chat',
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: false,
      }
      if (jsonMode) dsBody.response_format = { type: 'json_object' }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify(dsBody),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        const text = data?.choices?.[0]?.message?.content?.trim() ?? null
        const usage = data?.usage
        const promptTokens = usage?.prompt_tokens ?? estimateTokens(prompt)
        const completionTokens = usage?.completion_tokens ?? estimateTokens(text || '')
        const totalTokens = usage?.total_tokens ?? (promptTokens + completionTokens)

        if (text && text.length > 5) {
          console.log('[LLM Analyzer] DeepSeek fallback succeeded')
          return {
            text,
            usage: { promptTokens, completionTokens, totalTokens },
            provider: 'deepseek',
            model: 'deepseek-chat',
          }
        }
      } else {
        console.error('[LLM Analyzer] DeepSeek fallback failed:', res.status)
      }
    } catch (e: any) {
      console.error('[LLM Analyzer] DeepSeek fallback error:', e?.message)
    }
  }

  return { text: null, usage: emptyUsage, provider: 'none', model: 'none' }
}

const DEEPSEEK_MAX_RETRIES = 2
const DEEPSEEK_TIMEOUT = 60000

/**
 * Legacy DeepSeek streaming call helper (retained for backward compatibility).
 * Does NOT retry on 401/402/403 (auth/billing) — wastes seconds for nothing.
 */
export async function callDeepSeekWithRetry(
  messages: any[],
  apiKey: string
): Promise<Response> {
  let lastError: any = null
  for (let attempt = 0; attempt < DEEPSEEK_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT)

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: 4000,
          temperature: 0.85,
          stream: true,
          stream_options: { include_usage: true },
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (response.ok && response.body) {
        return response
      }
      const status = response.status
      let bodyHint = ''
      try {
        bodyHint = (await response.text()).slice(0, 200)
      } catch {
        /* ignore */
      }
      console.warn(`[DeepSeek] HTTP ${status} (attempt ${attempt + 1})`, bodyHint)
      lastError = new Error(
        status === 402
          ? `DeepSeek HTTP 402 — немає коштів на балансі (platform.deepseek.com)`
          : status === 401
            ? `DeepSeek HTTP 401 — невірний API-ключ`
            : `DeepSeek HTTP ${status}`
      )
      // Auth / payment: never retry
      if (status === 401 || status === 402 || status === 403) {
        throw lastError
      }
    } catch (e: any) {
      if (e?.message?.includes('DeepSeek HTTP')) throw e
      if (e?.name === 'AbortError') {
        console.warn(`[DeepSeek] timeout (attempt ${attempt + 1})`)
        lastError = new Error('DeepSeek timeout')
      } else {
        lastError = e
      }
    }
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
  }
  throw lastError ?? new Error('DeepSeek API failed after retries')
}

/**
 * Stream Gemini response via SSE. Tries several model ids until one works.
 */
export async function callGeminiStream(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  options: { maxTokens?: number; temperature?: number; model?: string } = {}
): Promise<{ stream: ReadableStream<Uint8Array>; getUsage: () => TokenUsage; model: string }> {
  const { maxTokens = 4000, temperature = 0.85 } = options
  const formatted = convertMessagesToGemini(messages)

  const body: any = {
    contents: formatted.contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  }
  if (formatted.systemInstruction) {
    body.system_instruction = formatted.systemInstruction
  }

  const models = options.model
    ? [options.model, ...getGeminiModelCandidates().filter((m) => m !== options.model)]
    : getGeminiModelCandidates()

  let lastErr = 'no models tried'
  for (const model of models) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      )
      clearTimeout(timeout)

      if (!res.ok || !res.body) {
        const hint = await res.text().catch(() => '')
        lastErr = `HTTP ${res.status} ${model} ${hint.slice(0, 120)}`
        console.warn(`[Gemini stream] ${lastErr}`)
        if (res.status !== 404) {
          // 400/403 etc — try next model anyway for 404 only is common; still try others
        }
        continue
      }

      console.log(`[Gemini stream] using model ${model}`)
      let promptTokens = 0
      let completionTokens = 0
      let totalTokens = 0
      let accumulatedText = ''

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controllerStream) {
          let buffer = ''
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() ?? ''

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const rawData = line.slice(6).trim()
                  if (!rawData || rawData === '[DONE]') continue
                  try {
                    const parsed = JSON.parse(rawData)

                    if (parsed.usageMetadata) {
                      promptTokens = parsed.usageMetadata.promptTokenCount ?? promptTokens
                      completionTokens =
                        parsed.usageMetadata.candidatesTokenCount ?? completionTokens
                      totalTokens =
                        parsed.usageMetadata.totalTokenCount ?? promptTokens + completionTokens
                    }

                    // Collect all text parts (skip thought-only blobs)
                    const parts = parsed?.candidates?.[0]?.content?.parts
                    if (Array.isArray(parts)) {
                      for (const part of parts) {
                        const chunkText = part?.text
                        if (chunkText) {
                          accumulatedText += chunkText
                          controllerStream.enqueue(encoder.encode(chunkText))
                        }
                      }
                    }
                  } catch {
                    // Ignore SSE parse errors for incomplete chunks
                  }
                }
              }
            }
          } catch (err) {
            controllerStream.error(err)
          } finally {
            if (!promptTokens) promptTokens = estimateTokens(JSON.stringify(messages))
            if (!completionTokens) completionTokens = estimateTokens(accumulatedText)
            if (!totalTokens) totalTokens = promptTokens + completionTokens
            controllerStream.close()
          }
        },
      })

      return {
        stream,
        model,
        getUsage: () => ({ promptTokens, completionTokens, totalTokens }),
      }
    } catch (e: any) {
      clearTimeout(timeout)
      lastErr = e?.message || String(e)
      console.warn(`[Gemini stream] ${model} error:`, lastErr)
    }
  }

  throw new Error(`Gemini stream failed: ${lastErr}`)
}

/**
 * Main narrator stream builder supporting provider selection & fallback.
 * Tries providers in order; on DeepSeek 402 always falls through to Gemini if configured.
 */
export async function callNarratorLLMStream(
  options: LLMStreamOptions
): Promise<LLMStreamResult> {
  const { messages, provider = 'auto', temperature = 0.85, maxTokens = 4000 } = options

  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim()
  // Optional: DEEPSEEK_DISABLED=1 to skip DeepSeek entirely (e.g. no balance)
  const deepseekDisabled =
    process.env.DEEPSEEK_DISABLED === '1' ||
    process.env.DEEPSEEK_DISABLED === 'true' ||
    process.env.DEEPSEEK_DISABLED === 'yes'

  const hasGemini = Boolean(geminiKey && !geminiKey.includes('встав') && geminiKey.length >= 8)
  const hasDeepSeek = Boolean(
    !deepseekDisabled &&
      deepseekKey &&
      !deepseekKey.includes('встав') &&
      deepseekKey.length >= 8
  )

  if (!hasGemini && !hasDeepSeek) {
    throw new Error(
      deepseekDisabled && geminiKey
        ? 'DeepSeek вимкнено (DEEPSEEK_DISABLED), а GEMINI_API_KEY невалідний.'
        : 'Жоден з API ключів (GEMINI_API_KEY / DEEPSEEK_API_KEY) не налаштований у .env!'
    )
  }

  /** Order to try. auto/dual: DeepSeek primary, Gemini fallback. */
  const order: Array<'gemini' | 'deepseek'> = []
  if (provider === 'gemini') {
    if (hasGemini) order.push('gemini')
    else if (hasDeepSeek) order.push('deepseek')
  } else if (provider === 'deepseek') {
    if (hasDeepSeek) order.push('deepseek')
    // Even if user picked deepseek, fall back to Gemini on hard failure
    if (hasGemini) order.push('gemini')
  } else {
    // auto | dual | anything else — DeepSeek first (main narrator)
    if (hasDeepSeek) order.push('deepseek')
    if (hasGemini) order.push('gemini')
  }

  if (order.length === 0) {
    throw new Error('Немає доступного LLM-провайдера для цього вибору.')
  }

  console.log(`[Narrator LLM] provider=${provider} try order: ${order.join(' → ')}`)

  const runGemini = async (): Promise<LLMStreamResult> => {
    console.log('[Narrator LLM] → Gemini (auto model)')
    const result = await callGeminiStream(messages, geminiKey!, { temperature, maxTokens })
    return {
      stream: result.stream,
      provider: 'gemini',
      providerLabel: `Gemini (${result.model})`,
      model: result.model,
      getUsage: result.getUsage,
    }
  }

  const runDeepSeek = async (): Promise<LLMStreamResult> => {
    console.log('[Narrator LLM] → DeepSeek Chat')
    const response = await callDeepSeekWithRetry(messages, deepseekKey!)
    let promptTokens = 0
    let completionTokens = 0
    let totalTokens = 0
    let accumulatedText = ''

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  if (parsed?.usage) {
                    promptTokens = parsed.usage.prompt_tokens ?? promptTokens
                    completionTokens = parsed.usage.completion_tokens ?? completionTokens
                    totalTokens =
                      parsed.usage.total_tokens ?? promptTokens + completionTokens
                  }
                  const chunk = parsed?.choices?.[0]?.delta?.content ?? ''
                  if (chunk) {
                    accumulatedText += chunk
                    controller.enqueue(encoder.encode(chunk))
                  }
                } catch {
                  /* ignore partial JSON lines */
                }
              }
            }
          }
        } catch (err) {
          controller.error(err)
        } finally {
          if (!promptTokens) promptTokens = estimateTokens(JSON.stringify(messages))
          if (!completionTokens) completionTokens = estimateTokens(accumulatedText)
          if (!totalTokens) totalTokens = promptTokens + completionTokens
          controller.close()
        }
      },
    })

    return {
      stream,
      provider: 'deepseek',
      providerLabel: 'DeepSeek Chat',
      model: 'deepseek-chat',
      getUsage: () => ({ promptTokens, completionTokens, totalTokens }),
    }
  }

  const errors: string[] = []
  for (const p of order) {
    try {
      if (p === 'gemini') return await runGemini()
      if (p === 'deepseek') return await runDeepSeek()
    } catch (err: any) {
      const msg = err?.message || String(err)
      errors.push(`${p}: ${msg}`)
      console.warn(`[Narrator LLM] ${p} failed → ${msg}`)
      // continue to next provider
    }
  }

  throw new Error(
    `Усі LLM-провайдери недоступні. ${errors.join(' | ')}. ` +
      (errors.some((e) => e.includes('402'))
        ? 'DeepSeek: поповни баланс на platform.deepseek.com або постав у меню Gemini / DEEPSEEK_DISABLED=1 у .env.'
        : 'Перевір GEMINI_API_KEY і DEEPSEEK_API_KEY у .env, перезапусти npm run dev.')
  )
}
