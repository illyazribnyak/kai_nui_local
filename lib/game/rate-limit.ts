/** Simple in-memory sliding window rate limiter (single-process). */

type Bucket = { timestamps: number[] }

const buckets = new Map<string, Bucket>()

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now()
  const windowStart = now - opts.windowMs
  let bucket = buckets.get(key)
  if (!bucket) {
    bucket = { timestamps: [] }
    buckets.set(key, bucket)
  }
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart)
  if (bucket.timestamps.length >= opts.limit) {
    const oldest = bucket.timestamps[0] ?? now
    return { ok: false, retryAfterMs: Math.max(0, oldest + opts.windowMs - now) }
  }
  bucket.timestamps.push(now)
  return { ok: true }
}

/** Test helper */
export function _resetRateLimits() {
  buckets.clear()
}
