import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/frontend use (uses anon key + RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side use (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'owner' | 'admin' | 'superadmin'
          avatar_url: string | null
          is_email_verified: boolean
          must_change_password: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      restaurants: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          cover_url: string | null
          address: string | null
          city: string | null
          country: string
          phone: string | null
          website: string | null
          wifi_name: string | null
          wifi_password_enc: string | null
          primary_color: string
          accent_color: string
          template_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>
      }
    }
  }
}
