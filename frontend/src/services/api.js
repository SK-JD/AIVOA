// Thin fetch wrapper around the FastAPI backend. Requests go to /api (Vite proxies to :8000).

// FastAPI error `detail` can be a string, an object, or a list of validation objects.
// Normalize any of them to a readable message so the UI never shows "[object Object]".
function formatDetail(detail) {
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
  if (typeof detail === 'object') return detail.msg || JSON.stringify(detail)
  return String(detail)
}

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    // headers set LAST so ...options can't clobber Content-Type; caller headers merge in.
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      detail = formatDetail((await res.json()).detail) || detail
    } catch {
      /* non-JSON error body — keep statusText */
    }
    throw new Error(detail)
  }
  return res.json()
}

export const api = {
  // App
  sendChat: (payload) => request('/chat', { method: 'POST', body: JSON.stringify(payload) }),
  searchHcps: (q) => request(`/hcps?q=${encodeURIComponent(q)}`),

  // Admin (token sent as X-Admin-Token header)
  getSettings: (token) => request('/admin/settings', { headers: { 'X-Admin-Token': token } }),
  saveSettings: (token, body) =>
    request('/admin/settings', {
      method: 'PUT',
      headers: { 'X-Admin-Token': token },
      body: JSON.stringify(body),
    }),
  testConnection: (token, body) =>
    request('/admin/test-connection', {
      method: 'POST',
      headers: { 'X-Admin-Token': token },
      body: JSON.stringify(body),
    }),
}
