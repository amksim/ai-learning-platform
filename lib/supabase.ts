import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase клиент для браузера - lazy initialization
let supabaseInstance: SupabaseClient | null = null

export function getSupabase() {
  // Только для клиентской стороны или с правильными env
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // На сервере при build - возвращаем mock
    return null as any
  }
  
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key are required')
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
      }
    })
  }
  return supabaseInstance
}

// Для обратной совместимости - используем getter
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  }
})

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
