/** Shared LLM helpers: Gemini with DeepSeek fallback. */

export async function callAnalyzerLLM(
  prompt: string,
  options: { maxTokens?: number; temperature?: number; jsonMode?: boolean } = {}
): Promise<string | null> {
  const { maxTokens = 2000, temperature = 0.3, jsonMode = false } = options
  const geminiKey = process.env.GEMINI_API_KEY
  const deepseekKey = process.env.DEEPSEEK_API_KEY

  if (geminiKey) {
    try {
      const geminiBody: any = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature },
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
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        if (text && text.length > 10) {
          console.log('[LLM] Gemini succeeded')
          return text
        }
      } else {
        console.warn(`[LLM] Gemini failed: ${res.status}, falling back to DeepSeek`)
      }
    } catch (e: any) {
      console.warn('[LLM] Gemini error:', e?.message, '→ fallback to DeepSeek')
    }
  }

  if (!deepseekKey) {
    console.warn('[LLM] No DeepSeek key available for fallback')
    return null
  }

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
      const text = data?.choices?.[0]?.message?.content?.trim()
      if (text && text.length > 10) {
        console.log('[LLM] DeepSeek fallback succeeded')
        return text
      }
    } else {
      console.error('[LLM] DeepSeek fallback also failed:', res.status)
    }
  } catch (e: any) {
    console.error('[LLM] DeepSeek fallback error:', e?.message)
  }

  return null
}

const DEEPSEEK_MAX_RETRIES = 2
const DEEPSEEK_TIMEOUT = 60000

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
    // brief backoff
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  throw lastError ?? new Error('DeepSeek API failed after retries')
}
