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

  // 1. Try Gemini
  if (geminiKey && !geminiKey.includes('встав') && geminiKey.length >= 8) {
    try {
      const geminiBody: any = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature },
        safetySettings: geminiSafetySettings,
      }
      if (jsonMode) geminiBody.generationConfig.responseMimeType = 'application/json'

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
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
        const totalTokens = meta?.totalTokenCount ?? (promptTokens + completionTokens)

        if (text && text.length > 5) {
          console.log('[LLM Analyzer] Gemini 2.0 Flash succeeded')
          return {
            text,
            usage: { promptTokens, completionTokens, totalTokens },
            provider: 'gemini',
            model: 'gemini-2.0-flash',
          }
        }
      } else {
        console.warn(`[LLM Analyzer] Gemini failed: HTTP ${res.status}, falling back to DeepSeek`)
      }
    } catch (e: any) {
      console.warn('[LLM Analyzer] Gemini error:', e?.message, '→ fallback to DeepSeek')
    }
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
      console.warn(`DeepSeek attempt ${attempt + 1} failed: ${response.status}`)
      lastError = new Error(`DeepSeek HTTP ${response.status}`)
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        console.warn(`DeepSeek attempt ${attempt + 1} timed out`)
        lastError = new Error('DeepSeek timeout')
      } else {
        lastError = e
      }
    }
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  throw lastError ?? new Error('DeepSeek API failed after retries')
}

/**
 * Stream Gemini 2.0 Flash response via SSE.
 */
export async function callGeminiStream(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<{ stream: ReadableStream<Uint8Array>; getUsage: () => TokenUsage }> {
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

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    }
  )
  clearTimeout(timeout)

  if (!res.ok || !res.body) {
    throw new Error(`Gemini stream failed with HTTP ${res.status}`)
  }

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

                // Track token usage
                if (parsed.usageMetadata) {
                  promptTokens = parsed.usageMetadata.promptTokenCount ?? promptTokens
                  completionTokens = parsed.usageMetadata.candidatesTokenCount ?? completionTokens
                  totalTokens = parsed.usageMetadata.totalTokenCount ?? (promptTokens + completionTokens)
                }

                const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
                if (chunkText) {
                  accumulatedText += chunkText
                  controllerStream.enqueue(encoder.encode(chunkText))
                }
              } catch (e) {
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
    getUsage: () => ({ promptTokens, completionTokens, totalTokens }),
  }
}

/**
 * Main narrator stream builder supporting provider selection & fallback.
 */
export async function callNarratorLLMStream(
  options: LLMStreamOptions
): Promise<LLMStreamResult> {
  const { messages, provider = 'auto', temperature = 0.85, maxTokens = 4000 } = options

  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim()

  const hasGemini = Boolean(geminiKey && !geminiKey.includes('встав') && geminiKey.length >= 8)
  const hasDeepSeek = Boolean(deepseekKey && !deepseekKey.includes('встав') && deepseekKey.length >= 8)

  if (!hasGemini && !hasDeepSeek) {
    throw new Error('Жоден з API ключів (GEMINI_API_KEY / DEEPSEEK_API_KEY) не налаштований у .env!')
  }

  let primary: 'gemini' | 'deepseek' = 'deepseek'
  if (provider === 'gemini' && hasGemini) primary = 'gemini'
  else if (provider === 'deepseek' && hasDeepSeek) primary = 'deepseek'
  else if (provider === 'auto') {
    primary = hasDeepSeek ? 'deepseek' : 'gemini'
  }

  // Attempt Primary Provider
  try {
    if (primary === 'gemini' && hasGemini) {
      console.log('[Narrator LLM] Using Gemini 2.0 Flash')
      const result = await callGeminiStream(messages, geminiKey!, { temperature, maxTokens })
      return {
        stream: result.stream,
        provider: 'gemini',
        providerLabel: 'Gemini 2.0 Flash',
        model: 'gemini-2.0-flash',
        getUsage: result.getUsage,
      }
    }
  } catch (err: any) {
    console.warn('[Narrator LLM] Gemini primary failed:', err?.message, '→ Fallback to DeepSeek')
  }

  // Fallback / DeepSeek Primary
  if (hasDeepSeek) {
    console.log('[Narrator LLM] Using DeepSeek Chat')
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
                    totalTokens = parsed.usage.total_tokens ?? (promptTokens + completionTokens)
                  }
                  const chunk = parsed?.choices?.[0]?.delta?.content ?? ''
                  if (chunk) {
                    accumulatedText += chunk
                    controller.enqueue(encoder.encode(chunk))
                  }
                } catch (e) {}
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

  // If DeepSeek was primary and failed, try Gemini if available
  if (hasGemini) {
    console.log('[Narrator LLM] Falling back to Gemini 2.0 Flash')
    const result = await callGeminiStream(messages, geminiKey!, { temperature, maxTokens })
    return {
      stream: result.stream,
      provider: 'gemini',
      providerLabel: 'Gemini 2.0 Flash',
      model: 'gemini-2.0-flash',
      getUsage: result.getUsage,
    }
  }

  throw new Error('Не вдалося виконати запит через обраний LLM провайдер.')
}
