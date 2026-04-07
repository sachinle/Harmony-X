import axios from 'axios'
import { supabase } from './supabase'

// Base API client for Supabase REST (optional, but you can use supabase directly)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  headers: {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  },
})

// Helper to get current session token for Firebase (if needed)
export const getFirebaseToken = async () => {
  const { getAuth } = await import('firebase/auth')
  const auth = getAuth()
  const user = auth.currentUser
  if (user) {
    return user.getIdToken()
  }
  return null
}