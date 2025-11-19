export function setCache(key, value) {
  try {
    const payload = { t: Date.now(), v: value }
    localStorage.setItem(`cache:${key}`, JSON.stringify(payload))
  } catch {}
}

export function getCache(key, fallback = null, maxAgeMs = 1000 * 60 * 60) { // default 1h
  try {
    const raw = localStorage.getItem(`cache:${key}`)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    if (Date.now() - parsed.t > maxAgeMs) return fallback
    return parsed.v
  } catch {
    return fallback
  }
}

export function pushQueue(key, item) {
  try {
    const list = getCache(key, []) || []
    list.push(item)
    setCache(key, list)
  } catch {}
}

export function consumeQueue(key) {
  const items = getCache(key, []) || []
  setCache(key, [])
  return items
}
