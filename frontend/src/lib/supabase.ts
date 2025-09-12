import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  wallet_address: string
  api_key?: string
  api_key_hash?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  wallet_address: string
  has_api_key: boolean
  api_key?: string
  created_at?: string
}