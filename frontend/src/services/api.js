const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function apiRequest(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Unable to reach the AEROVAULT API.')
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error || 'The request could not be completed.')
  }

  return body?.data ?? null
}
