import { supabase } from '../supabase'

// Register user
export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data?.user, error }
}

// Login user
export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data?.user, error }
}

// Logout user
export async function logout() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  return { user: data?.user, error }
} 