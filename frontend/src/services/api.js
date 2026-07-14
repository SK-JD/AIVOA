// Thin fetch wrapper around the FastAPI backend. Requests go to /api (Vite proxies to :8000).

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      detail = (await res.json()).detail || detail
    } catch {
      /* ignore */
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
