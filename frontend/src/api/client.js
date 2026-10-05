const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
/** Defaults to live API. Set VITE_USE_MOCK=true only for offline UI prototyping. */
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'false').toLowerCase() === 'true'

const TOKEN_KEY = 'biofit.accessToken'
const REFRESH_KEY = 'biofit.refreshToken'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

/** True when the stored token is a frontend mock session, not a real JWT. */
export function isMockAccessToken(token = getAccessToken()) {
  const value = String(token || '')
  return !value || value.startsWith('mock-')
}

/**
 * Prefer live API only when mocks are disabled AND a real JWT is present.
 * Prevents 403s from leftover mock tokens after switching VITE_USE_MOCK=false.
 */
export function shouldUseMockData() {
  if (USE_MOCK) return true
  return isMockAccessToken()
}

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function parseBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  if (!USE_MOCK && token && isMockAccessToken(token)) {
    clearTokens()
    throw new ApiError('Please sign in again with your medical advisor account.', {
      status: 401,
      code: 'MOCK_TOKEN',
    })
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError(
      `Cannot reach the BioFit API at ${API_URL}. Start the backend (./mvnw.cmd spring-boot:run in the backend folder) and try again.`,
      { status: 0, code: 'NETWORK_ERROR' },
    )
  }

  const payload = await parseBody(response)

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      (response.status === 401
        ? 'Please sign in again.'
        : response.status === 403
          ? 'You do not have permission to do that. Sign out and sign in again.'
          : response.status === 405
            ? 'Delete is not available on the server yet. Restart the backend and try again.'
            : `Something went wrong. Please try again. (${response.status})`)
    throw new ApiError(message, {
      status: response.status,
      code: payload?.error?.code,
    })
  }

  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (!payload.success) {
      throw new ApiError(payload.error?.message || 'Request failed', {
        status: response.status,
        code: payload.error?.code,
      })
    }
    return payload.data
  }

  return payload
}
