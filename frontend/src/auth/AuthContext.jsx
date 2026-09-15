import { createContext, useContext, useEffect, useState } from 'react'
import {
  clearTokens,
  getAccessToken,
} from './../api/client'
import {
  fetchMe,
  homeForRole,
  loginRequest,
  logoutRequest,
  registerRequest,
  updateMe,
} from './../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      if (!getAccessToken()) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }
      try {
        const me = await fetchMe()
        if (!cancelled) setUser(me)
      } catch {
        clearTokens()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    role: user?.primaryRole || user?.roles?.[0] || null,
    roles: user?.roles || [],
    async login(email, password) {
      const result = await loginRequest(email, password)
      setUser(result.user)
      return result
    },
    async register(payload) {
      const result = await registerRequest(payload)
      setUser(result.user)
      return result
    },
    async logout() {
      await logoutRequest()
      setUser(null)
    },
    async refreshProfile() {
      const me = await fetchMe()
      setUser(me)
      return me
    },
    async updateProfile(payload) {
      const me = await updateMe(payload)
      setUser(me)
      return me
    },
    homePath: user ? homeForRole(user.primaryRole || user.roles?.[0]) : '/login',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
