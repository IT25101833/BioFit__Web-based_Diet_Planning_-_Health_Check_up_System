import { apiRequest, clearTokens, setTokens, USE_MOCK } from './client'

const ROLE_HOME = {
  CLIENT: '/dashboard',
  WELLNESS_CENTRE_MANAGER: '/manager/dashboard',
  FITNESS_COACH: '/coach/dashboard',
  NUTRITION_CONSULTANT: '/nutrition/dashboard',
  DIGITAL_OPERATIONS_EXECUTIVE: '/admin/dashboard',
  CUSTOMER_EXPERIENCE_OFFICER: '/support/dashboard',
  MEDICAL_ADVISOR: '/medical/dashboard',
  ADMIN: '/admin/dashboard',
}

export function homeForRole(role) {
  return ROLE_HOME[role] || '/dashboard'
}

const PENDING_EMAIL_KEY = 'biofit-pending-verification-email'

export function setPendingVerificationEmail(email) {
  try {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim().toLowerCase())
  } catch {
    // ignore
  }
}

export function getPendingVerificationEmail() {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY) || ''
  } catch {
    return ''
  }
}

export function clearPendingVerificationEmail() {
  try {
    sessionStorage.removeItem(PENDING_EMAIL_KEY)
  } catch {
    // ignore
  }
}

const MOCK_USERS = {
  'client@biofit.demo': {
    id: 1,
    email: 'client@biofit.demo',
    firstName: 'Alex',
    lastName: 'Morgan',
    fullName: 'Alex Morgan',
    contactNumber: '+94 77 100 2001',
    specialization: null,
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['CLIENT'],
    primaryRole: 'CLIENT',
    password: 'Demo123!',
  },
  'manager@biofit.demo': {
    id: 2,
    email: 'manager@biofit.demo',
    firstName: 'Sarah',
    lastName: 'Williams',
    fullName: 'Sarah Williams',
    contactNumber: '+94 77 100 2002',
    specialization: 'Centre operations',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['WELLNESS_CENTRE_MANAGER'],
    primaryRole: 'WELLNESS_CENTRE_MANAGER',
    password: 'Demo123!',
  },
  'coach@biofit.demo': {
    id: 3,
    email: 'coach@biofit.demo',
    firstName: 'Daniel',
    lastName: 'Perera',
    fullName: 'Daniel Perera',
    contactNumber: '+94 77 100 2003',
    specialization: 'Strength & conditioning',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['FITNESS_COACH'],
    primaryRole: 'FITNESS_COACH',
    password: 'Demo123!',
  },
  'nutrition@biofit.demo': {
    id: 4,
    email: 'nutrition@biofit.demo',
    firstName: 'Maya',
    lastName: 'Fernando',
    fullName: 'Maya Fernando',
    contactNumber: '+94 77 100 2004',
    specialization: 'Clinical nutrition',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['NUTRITION_CONSULTANT'],
    primaryRole: 'NUTRITION_CONSULTANT',
    password: 'Demo123!',
  },
  'operations@biofit.demo': {
    id: 5,
    email: 'operations@biofit.demo',
    firstName: 'Jordan',
    lastName: 'Lee',
    fullName: 'Jordan Lee',
    contactNumber: '+94 77 100 2005',
    specialization: 'Platform operations',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['DIGITAL_OPERATIONS_EXECUTIVE'],
    primaryRole: 'DIGITAL_OPERATIONS_EXECUTIVE',
    password: 'Demo123!',
  },
  'support@biofit.demo': {
    id: 6,
    email: 'support@biofit.demo',
    firstName: 'Priya',
    lastName: 'Nair',
    fullName: 'Priya Nair',
    contactNumber: '+94 77 100 2006',
    specialization: 'Customer experience',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['CUSTOMER_EXPERIENCE_OFFICER'],
    primaryRole: 'CUSTOMER_EXPERIENCE_OFFICER',
    password: 'Demo123!',
  },
  'medical@biofit.demo': {
    id: 7,
    email: 'medical@biofit.demo',
    firstName: 'Elena',
    lastName: 'Costa',
    fullName: 'Elena Costa',
    contactNumber: '+94 77 100 2007',
    specialization: 'Preventive health',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['MEDICAL_ADVISOR'],
    primaryRole: 'MEDICAL_ADVISOR',
    password: 'Demo123!',
  },
  'admin@biofit.demo': {
    id: 8,
    email: 'admin@biofit.demo',
    firstName: 'Sam',
    lastName: 'Okoye',
    fullName: 'Sam Okoye',
    contactNumber: '+94 77 100 2008',
    specialization: 'System admin',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['ADMIN'],
    primaryRole: 'ADMIN',
    password: 'Demo123!',
  },
}

const LOCAL_USERS_KEY = 'biofit.mockUsers'
/** In-memory OTP state for mock mode only (never persisted; never returned to UI). */
const mockOtpStore = new Map()

function loadLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveLocalUser(user) {
  const all = loadLocalUsers()
  all[user.email.toLowerCase()] = user
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(all))
}

function findMockUser(email) {
  const key = email.trim().toLowerCase()
  return MOCK_USERS[key] || loadLocalUsers()[key] || null
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateMockOtp() {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return String(bytes[0] % 1_000_000).padStart(6, '0')
}

async function hashOtp(otp) {
  const data = new TextEncoder().encode(`biofit-otp:${otp}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function issueMockOtp(email) {
  const otp = generateMockOtp()
  const hash = await hashOtp(otp)
  mockOtpStore.set(email, {
    hash,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
    lastSentAt: Date.now(),
  })
}

export async function loginRequest(email, password) {
  if (USE_MOCK) {
    await delay()
    const user = findMockUser(email)
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password.')
    }
    if (user.emailVerified === false) {
      const err = new Error(
        'Please verify your email before signing in. Check your inbox for the verification code.',
      )
      err.code = 'EMAIL_NOT_VERIFIED'
      throw err
    }
    const { password: _pw, ...safe } = user
    setTokens({
      accessToken: `mock-access-${safe.id}`,
      refreshToken: `mock-refresh-${safe.id}`,
    })
    return {
      accessToken: `mock-access-${safe.id}`,
      refreshToken: `mock-refresh-${safe.id}`,
      tokenType: 'Bearer',
      user: { ...safe, emailVerified: safe.emailVerified !== false },
    }
  }

  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  return data
}

export async function registerRequest(payload) {
  if (USE_MOCK) {
    await delay()
    const email = payload.email.trim().toLowerCase()
    if (findMockUser(email)) {
      throw new Error('An account already exists with this email address.')
    }
    const user = {
      id: Date.now(),
      email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      fullName: `${payload.firstName} ${payload.lastName}`,
      contactNumber: payload.contactNumber || '',
      specialization: null,
      status: 'ACTIVE',
      emailVerified: false,
      roles: ['CLIENT'],
      primaryRole: 'CLIENT',
      password: payload.password,
    }
    saveLocalUser(user)
    await issueMockOtp(email)
    setPendingVerificationEmail(email)
    return {
      email,
      message: 'Account created. Please verify your email with the code we sent.',
      verificationRequired: true,
      devOtp: null,
    }
  }
  const data = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setPendingVerificationEmail(data.email || payload.email)
  return data
}

export async function verifyEmailRequest(email, otp) {
  if (USE_MOCK) {
    await delay()
    const key = email.trim().toLowerCase()
    const user = findMockUser(key)
    if (!user) {
      throw Object.assign(new Error('No account found for this email.'), { code: 'NOT_FOUND' })
    }
    if (user.emailVerified) {
      throw Object.assign(new Error('This email is already verified. You can sign in.'), {
        code: 'ALREADY_VERIFIED',
      })
    }
    const pending = mockOtpStore.get(key)
    if (!pending) {
      throw Object.assign(
        new Error('No verification code is pending. Please request a new code.'),
        { code: 'OTP_MISSING' },
      )
    }
    if (pending.attempts >= 5) {
      mockOtpStore.delete(key)
      throw Object.assign(
        new Error('Too many incorrect attempts. Please request a new verification code.'),
        { code: 'OTP_ATTEMPTS_EXCEEDED' },
      )
    }
    if (pending.expiresAt < Date.now()) {
      mockOtpStore.delete(key)
      throw Object.assign(
        new Error('This verification code has expired. Please request a new code.'),
        { code: 'OTP_EXPIRED' },
      )
    }
    const hash = await hashOtp(otp.trim())
    if (hash !== pending.hash) {
      pending.attempts += 1
      if (pending.attempts >= 5) {
        mockOtpStore.delete(key)
        throw Object.assign(
          new Error('Too many incorrect attempts. Please request a new verification code.'),
          { code: 'OTP_ATTEMPTS_EXCEEDED' },
        )
      }
      throw Object.assign(new Error('Invalid verification code. Please try again.'), {
        code: 'OTP_INVALID',
      })
    }
    user.emailVerified = true
    saveLocalUser(user)
    mockOtpStore.delete(key)
    clearPendingVerificationEmail()
    return {
      email: key,
      message: 'Email verified successfully. You can now sign in.',
      verified: true,
    }
  }

  const data = await apiRequest('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })
  clearPendingVerificationEmail()
  return data
}

export async function resendVerificationRequest(email) {
  if (USE_MOCK) {
    await delay()
    const key = email.trim().toLowerCase()
    const user = findMockUser(key)
    if (!user) {
      throw Object.assign(new Error('No account found for this email.'), { code: 'NOT_FOUND' })
    }
    if (user.emailVerified) {
      throw Object.assign(new Error('This email is already verified. You can sign in.'), {
        code: 'ALREADY_VERIFIED',
      })
    }
    const pending = mockOtpStore.get(key)
    if (pending?.lastSentAt && Date.now() - pending.lastSentAt < 60_000) {
      const wait = Math.ceil((60_000 - (Date.now() - pending.lastSentAt)) / 1000)
      throw Object.assign(
        new Error(`Please wait ${wait} seconds before requesting a new code.`),
        { code: 'OTP_RESEND_COOLDOWN' },
      )
    }
    await issueMockOtp(key)
    setPendingVerificationEmail(key)
    return {
      email: key,
      message: 'A new verification code has been sent to your email.',
      verificationRequired: true,
      devOtp: null,
    }
  }

  return apiRequest('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  })
}

export async function fetchMe() {
  if (USE_MOCK) {
    await delay(200)
    const token = localStorage.getItem('biofit.accessToken') || ''
    const id = Number(String(token).replace('mock-access-', ''))
    const fromSeed = Object.values(MOCK_USERS).find((u) => u.id === id)
    const fromLocal = Object.values(loadLocalUsers()).find((u) => u.id === id)
    const user = fromSeed || fromLocal
    if (!user) throw new Error('Session expired.')
    const { password: _pw, ...safe } = user
    return { ...safe, emailVerified: safe.emailVerified !== false }
  }
  return apiRequest('/api/auth/me')
}

export async function updateMe(payload) {
  if (USE_MOCK) {
    await delay(300)
    const me = await fetchMe()
    return { ...me, ...payload, fullName: `${payload.firstName || me.firstName} ${payload.lastName || me.lastName}` }
  }
  return apiRequest('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function logoutRequest() {
  try {
    if (!USE_MOCK) {
      const refreshToken = localStorage.getItem('biofit.refreshToken')
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    }
  } finally {
    clearTokens()
  }
}
