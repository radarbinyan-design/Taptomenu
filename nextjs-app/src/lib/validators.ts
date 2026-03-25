/**
 * TapMenu Armenia — Shared Zod Validators
 *
 * Central validation schemas for all API inputs.
 * Used in API routes and can be shared with client-side forms.
 *
 * Convention:
 *   - Schema names: {Entity}{Action}Schema (e.g., DishCreateSchema)
 *   - All IDs are UUIDs
 *   - Prices are integers in AMD
 */

import { z } from 'zod'

// ─── Reusable Primitives ──────────────────────────────────────────────────────

export const uuidSchema = z.string().uuid('Invalid UUID')
export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(60, 'Slug must be at most 60 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

// ─── Restaurant ───────────────────────────────────────────────────────────────

export const RestaurantCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: slugSchema.optional(), // auto-generated if omitted
  description: z.string().max(2000).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).default('AM'),
  phone: z.string().max(50).optional(),
  website: z.string().url().max(255).optional().or(z.literal('')),
  wifiName: z.string().max(100).optional(),
  wifiPassword: z.string().max(100).optional(), // will be encrypted server-side
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#F59E0B'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1F2937'),
  templateId: z.string().max(50).default('classic'),
})

export const RestaurantUpdateSchema = RestaurantCreateSchema.partial()

// ─── Dish ─────────────────────────────────────────────────────────────────────

export const DishCreateSchema = z.object({
  restaurantId: uuidSchema,
  name: z.string().min(1, 'Name is required').max(255),
  nameTranslations: z.record(z.string(), z.string()).optional(),
  description: z.string().max(2000).optional(),
  descriptionTranslations: z.record(z.string(), z.string()).optional(),
  price: z.coerce.number().int().min(0, 'Price must be >= 0'),
  calories: z.coerce.number().int().min(0).optional().nullable(),
  proteins: z.coerce.number().min(0).optional().nullable(),
  fats: z.coerce.number().min(0).optional().nullable(),
  carbohydrates: z.coerce.number().min(0).optional().nullable(),
  weight: z.coerce.number().int().min(0).optional().nullable(),
  spicyLevel: z.coerce.number().int().min(0).max(3).default(0),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  allergens: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  sortOrder: z.coerce.number().int().default(0),
})

export const DishUpdateSchema = DishCreateSchema.partial().omit({ restaurantId: true })

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const MenuCreateSchema = z.object({
  restaurantId: uuidSchema,
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  isDefault: z.boolean().default(false),
  languages: z.array(z.string().min(2).max(5)).min(1).default(['ru']),
  sortOrder: z.coerce.number().int().default(0),
})

export const MenuUpdateSchema = MenuCreateSchema.partial().omit({ restaurantId: true })

// ─── Category ─────────────────────────────────────────────────────────────────

export const CategoryCreateSchema = z.object({
  menuId: uuidSchema,
  name: z.string().min(1, 'Name is required').max(255),
  nameTranslations: z.record(z.string(), z.string()).optional(),
  emoji: z.string().max(10).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const CategoryUpdateSchema = CategoryCreateSchema.partial().omit({ menuId: true })

// ─── MenuDish (link dish to menu + category) ─────────────────────────────────

export const MenuDishLinkSchema = z.object({
  menuId: uuidSchema,
  dishId: uuidSchema,
  categoryId: uuidSchema.optional(),
  sortOrder: z.coerce.number().int().default(0),
  isAvailable: z.boolean().default(true),
  specialPrice: z.coerce.number().int().min(0).optional().nullable(),
})

// ─── Table ────────────────────────────────────────────────────────────────────

export const TableCreateSchema = z.object({
  restaurantId: uuidSchema,
  name: z.string().min(1, 'Name is required').max(100),
  nfcTagId: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
})

export const TableUpdateSchema = TableCreateSchema.partial().omit({ restaurantId: true })

// ─── Order (Guest Ordering — Phase 01) ────────────────────────────────────────

export const OrderCreateSchema = z.object({
  restaurantId: uuidSchema,
  tableId: uuidSchema.optional(),
  guestName: z.string().max(255).optional(),
  guestPhone: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        dishId: uuidSchema,
        quantity: z.coerce.number().int().min(1).max(99),
        specialInstructions: z.string().max(500).optional(),
      })
    )
    .min(1, 'Order must have at least one item'),
})

export const OrderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
})

// ─── MenuView ─────────────────────────────────────────────────────────────────

export const MenuViewCreateSchema = z.object({
  restaurantId: uuidSchema,
  tableId: uuidSchema.optional(),
  lang: z.string().min(2).max(5).default('ru'),
  device: z.enum(['mobile', 'desktop', 'tablet']).optional(),
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().max(50).optional(),
  restaurantName: z.string().min(1, 'Restaurant name is required').max(255),
  plan: z.enum(['starter', 'pro', 'premium', 'luxe']).default('pro'),
})

// ─── Lead ─────────────────────────────────────────────────────────────────────

export const LeadCreateSchema = z.object({
  name: z.string().min(1).max(255),
  restaurantName: z.string().max(255).optional(),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  plan: z.string().max(50).default('pro'),
  message: z.string().max(5000).optional(),
})

// ─── Subscription Checkout (Phase 04) ────────────────────────────────────────

export const CheckoutCreateSchema = z.object({
  plan: z.enum(['starter', 'pro', 'premium', 'luxe']),
  isYearly: z.boolean().default(false),
})

export const SubscriptionActionSchema = z.object({
  action: z.enum(['cancel', 'resume']),
})

// ─── Payment Transaction ─────────────────────────────────────────────────────

export const PaymentTransactionFilterSchema = z.object({
  status: z.enum(['pending', 'succeeded', 'failed', 'refunded', 'cancelled']).optional(),
  type: z.enum(['subscription_create', 'subscription_renew', 'subscription_upgrade', 'subscription_downgrade', 'refund']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── Transformer (Phase 03) ──────────────────────────────────────────────────

export const TranslateRequestSchema = z.object({
  menuId: uuidSchema,
  restaurantId: uuidSchema,
  targetLangs: z.array(z.string().min(2).max(5)).min(1).max(33),
  sourceLang: z.string().min(2).max(5).default('ru'),
  provider: z.enum(['deepl', 'google', 'openai', 'demo']).optional(),
})

export const DescribeRequestSchema = z.object({
  dishId: uuidSchema.optional(),
  dishName: z.string().min(1).max(255),
  ingredients: z.array(z.string()).optional(),
  category: z.string().max(255).optional(),
  targetLang: z.string().min(2).max(5).default('ru'),
  style: z.enum(['appetizing', 'concise', 'detailed', 'poetic']).default('appetizing'),
  save: z.boolean().default(false),
  restaurantId: uuidSchema.optional(),
})

export const ImageGenerateRequestSchema = z.object({
  dishId: uuidSchema.optional(),
  dishName: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  style: z.enum(['photo', 'illustration', 'watercolor']).default('photo'),
  save: z.boolean().default(false),
  restaurantId: uuidSchema.optional(),
})

export const OcrRequestSchema = z.object({
  imageUrl: z.string().min(1).max(2048),
  restaurantId: uuidSchema,
  sourceLang: z.string().min(2).max(5).default('ru'),
  format: z.enum(['structured', 'raw']).default('structured'),
})

// ─── Helper: extract error messages ───────────────────────────────────────────

export function formatZodErrors(error: z.ZodError): string {
  return error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('; ')
}
