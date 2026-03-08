import { createClient, SupabaseClient } from '@supabase/supabase-js'

/* ─── Config check ───────────────────────────────────────────────────────── */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

/** Returns true when real Supabase credentials are configured */
export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey.length > 20
  )
}

/* ─── Clients ────────────────────────────────────────────────────────────── */

/**
 * Browser / server component client.
 * Uses anon key — respects RLS policies.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

/**
 * Server-only admin client.
 * Uses service-role key — bypasses RLS.
 * NEVER expose to client-side code.
 */
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || supabaseAnonKey || 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/* ─── Database types (matches Supabase schema) ───────────────────────────── */
export type UserRole = 'owner' | 'admin' | 'superadmin'
export type SubscriptionPlan = 'starter' | 'pro' | 'premium' | 'luxe'
export type SubscriptionStatus = 'trial' | 'active' | 'grace' | 'blocked' | 'cancelled'
export type DishStatus = 'active' | 'inactive' | 'archived'
export type MenuStatus = 'active' | 'inactive' | 'draft'
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'rejected'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: UserRole
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

      dishes: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          name_translations: Record<string, string> | null
          description: string | null
          description_translations: Record<string, string> | null
          price: number
          image_url: string | null
          image_url_md: string | null
          image_url_sm: string | null
          calories: number | null
          proteins: number | null
          fats: number | null
          carbohydrates: number | null
          weight: number | null
          spicy_level: number
          is_vegan: boolean
          is_gluten_free: boolean
          allergens: string[]
          tags: string[]
          status: DishStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['dishes']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['dishes']['Insert']>
      }

      menus: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          status: MenuStatus
          is_default: boolean
          languages: string[]
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['menus']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['menus']['Insert']>
      }

      leads: {
        Row: {
          id: string
          name: string
          restaurant_name: string | null
          email: string
          phone: string | null
          plan: SubscriptionPlan
          message: string | null
          status: LeadStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['leads']['Row']>
      }

      exchange_rates: {
        Row: {
          id: string
          from_currency: string
          to_currency: string
          rate: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['exchange_rates']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['exchange_rates']['Insert']>
      }
    }
  }
}
