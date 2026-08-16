/* global moments_like */

const JSON_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  })
}

function isMomentPath(value) {
  if (typeof value !== 'string' || value.length <= '/moments/'.length || value.length > 512 || !value.startsWith('/moments/'))
    return false
  if ([',', '?', '#'].some(character => value.includes(character)))
    return false
  return !Array.from(value).some((character) => {
    const code = character.codePointAt(0) ?? 0
    return code <= 31 || code === 127
  })
}

function normalizeCount(value) {
  const count = Number(value)
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
}

async function getMomentKey(momentPath) {
  const bytes = new TextEncoder().encode(momentPath)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  return `moment_${hex}`
}

function getStore() {
  if (typeof moments_like === 'undefined')
    throw new Error('The moments_like KV binding is not configured')
  return moments_like
}

export async function onRequestGet({ request }) {
  try {
    const ids = new URL(request.url).searchParams.get('ids')?.split(',').filter(Boolean) ?? []
    const uniqueIds = [...new Set(ids)]

    if (uniqueIds.length > 100 || uniqueIds.some(id => !isMomentPath(id)))
      return json({ error: 'Invalid moment ids' }, 400)

    const store = getStore()
    const entries = await Promise.all(uniqueIds.map(async (momentId) => {
      const value = await store.get(await getMomentKey(momentId))
      return [momentId, normalizeCount(value)]
    }))

    return json(Object.fromEntries(entries))
  }
  catch {
    return json({ error: 'Moments like are temporarily unavailable' }, 503)
  }
}

export async function onRequestPost({ request }) {
  try {
    const body = await request.json()
    const momentId = body?.momentId
    const action = body?.action
    if (!isMomentPath(momentId) || (action !== 'like' && action !== 'unlike'))
      return json({ error: 'Invalid request body' }, 400)

    const store = getStore()
    const key = await getMomentKey(momentId)
    const currentCount = normalizeCount(await store.get(key))
    const count = Math.max(0, currentCount + (action === 'like' ? 1 : -1))

    // EdgeOne KV does not expose an atomic increment/decrement API. This
    // read-modify-write counter is intentionally lightweight and eventually consistent.
    await store.put(key, String(count))
    return json({ count })
  }
  catch {
    return json({ error: 'Moments like are temporarily unavailable' }, 503)
  }
}
