import { API_BASE_URL } from './index'

function joinUrl(base, path) {
  if (!path) return base
  // If absolute URL provided in path, respect it
  if (/^https?:\/\//i.test(path)) return path
  const b = String(base || '').replace(/\/+$/, '')
  const p = `/${String(path).replace(/^\/+/, '')}`
  return (b + p).replace(/\/+/g, '/').replace(':/', '://')
}

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const url = joinUrl(API_BASE_URL, path)
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const msg = text || `Request failed ${res.status} ${res.statusText}`
    throw new Error(msg)
  }
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}
