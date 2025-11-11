import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const createSupabaseClient = () => {
  return createClientComponentClient()
}

export type Reservation = {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_phone: string
  reservation_date: string
  reservation_time: string
  number_of_people: number
  special_requests?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  updated_at: string
}

export type FacebookPost = {
  id: string
  message?: string
  full_picture?: string
  permalink_url?: string
  created_time: string
  likes_count: number
  comments_count: number
  shares_count: number
  is_published: boolean
  synced_at: string
}
