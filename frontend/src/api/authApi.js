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
    roles: ['ADMIN'],
    primaryRole: 'ADMIN',
    password: 'Demo123!',
  },
}

const LOCAL_USERS_KEY = 'biofit.mockUsers'

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

export async function loginRequest(email, password) {
  if (USE_MOCK) {
    await delay()
    const user = findMockUser(email)
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password.')
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
      user: safe,
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
      roles: ['CLIENT'],
      primaryRole: 'CLIENT',
      password: payload.password,
    }
    saveLocalUser(user)
    const { password: _pw, ...safe } = user
    setTokens({
      accessToken: `mock-access-${safe.id}`,
      refreshToken: `mock-refresh-${safe.id}`,
    })
    return {
      accessToken: `mock-access-${safe.id}`,
      refreshToken: `mock-refresh-${safe.id}`,
      tokenType: 'Bearer',
      user: safe,
    }
  }
  const data = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  return data
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
    return safe
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
