import { createClient } from '@supabase/supabase-js'

// Supabase клиент - создаём один раз
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Создаём клиент только на клиенте
export const supabase = typeof window !== 'undefined' 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    })
  : createClient(supabaseUrl || '', supabaseAnonKey || '', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

// Для обратной совместимости
export function getSupabase() {
  return supabase
}

// Типы для базы данных
export type Profile = {
  id: string
  email: string
  full_name: string | null
  telegram_username: string | null
  avatar_url: string | null
  subscription_status: 'free' | 'premium'
  subscription_end_date: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export type UserProgress = {
  id: string
  user_id: string
  course_slug: string
  lesson_index: number
  completed: boolean
  code_solution: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  user_id: string
  stripe_payment_id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  subscription_type: 'monthly' | 'yearly' | null
  created_at: string
}

export type UserProject = {
  id: string
  user_id: string
  title: string
  description: string | null
  code: string | null
  language: string
  is_public: boolean
  likes_count: number
  created_at: string
  updated_at: string
}
