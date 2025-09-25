import config from '../config/api.js'

// Register user
export async function signUpWithEmail(email, password) {
  try {
    const res = await fetch(config.getUrl(config.endpoints.auth.register), {
      method: 'POST',
      headers: config.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) return { user: null, error: new Error(data?.error || 'Register failed') }
    return { user: data.user, error: null }
  } catch (e) {
    return { user: null, error: e }
  }
}

// Login user
export async function loginWithEmail(email, password) {
  try {
    const res = await fetch(config.getUrl(config.endpoints.auth.login), {
      method: 'POST',
      headers: config.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) return { user: null, error: new Error(data?.error || 'Login failed') }
    return { user: data.user, error: null }
  } catch (e) {
    return { user: null, error: e }
  }
}

// Logout user
export async function logout() {
  try {
    const res = await fetch(config.getUrl(config.endpoints.auth.logout), {
      method: 'POST',
      credentials: 'include'
    })
    if (!res.ok) return { error: new Error('Logout failed') }
    return { error: null }
  } catch (e) {
    return { error: e }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    console.log('getCurrentUser: Making request to:', config.getUrl(config.endpoints.auth.me));
    const res = await fetch(config.getUrl(config.endpoints.auth.me), {
      method: 'GET',
      credentials: 'include'
    })
    console.log('getCurrentUser: Response status:', res.status);
    const data = await res.json()
    console.log('getCurrentUser: Response data:', data);
    return { user: data?.user || null, error: null }
  } catch (e) {
    console.error('getCurrentUser: Error:', e);
    return { user: null, error: e }
  }
} 