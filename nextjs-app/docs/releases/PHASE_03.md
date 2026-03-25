# Phase 03 — Transformer (AI)

**Date:** 2026-03-25
**Branch:** `genspark_ai_developer`
**Feature Flag:** `FF_TRANSFORMER`

## Overview

Phase 03 adds AI-powered menu transformation capabilities:
- **Multi-provider Translation:** DeepL, Google Translate, OpenAI GPT fallback, demo mode
- **AI Description Generation:** GPT-powered appetizing dish descriptions (4 styles)
- **AI Image Generation:** DALL-E 3 dish image generation (placeholder, requires direct key)
- **OCR Pipeline:** Menu text extraction from photos (placeholder with TODO for real dev)
- **Usage Tracking:** Token/request tracking per restaurant and provider
- **Translation Management UI:** Full dashboard page at `/dashboard/translations`

## Files Changed

### New Files
| File | Description |
|------|-------------|
| `src/lib/transformer.ts` | Core transformer engine — translation, description, image providers |
| `src/app/api/transformer/translate/route.ts` | POST — Batch translate menu dishes/categories |
| `src/app/api/transformer/describe/route.ts` | POST — Generate AI dish descriptions |
| `src/app/api/transformer/image/route.ts` | POST — Generate dish images (DALL-E 3) |
| `src/app/api/transformer/usage/route.ts` | GET — Usage stats per restaurant |
| `src/app/api/transformer/ocr/route.ts` | POST — OCR menu import (placeholder) |
| `src/app/dashboard/translations/page.tsx` | Full translations management UI |
| `supabase/migrations/0005_transformer_usage.sql` | TransformerUsage table + RLS |

### Modified Files
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added `TransformerUsage` model |
| `src/hooks/index.ts` | Added `useTransformer` hook (translate, describe, image, OCR) |
| `src/lib/validators.ts` | Added Zod schemas: `TranslateRequestSchema`, `DescribeRequestSchema`, `ImageGenerateRequestSchema`, `OcrRequestSchema` |
| `src/types/index.ts` | Added transformer types, updated `RESTAURANT_ADMIN_TABS` |
| `src/middleware.ts` | Added `/dashboard/dishes` to RESTAURANT_ADMIN_ALLOWED |
| `src/app/dashboard/layout.tsx` | Made Dishes and Analytics visible for RESTAURANT_ADMIN |

## API Endpoints (5 new)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/transformer/translate` | Owner+ | Batch translate menu into target languages |
| POST | `/api/transformer/describe` | Owner+ | Generate AI dish description |
| POST | `/api/transformer/image` | Owner+ | Generate dish image (DALL-E 3) |
| POST | `/api/transformer/ocr` | Owner+ | OCR menu extraction from image |
| GET | `/api/transformer/usage` | Owner+ | Usage stats by type/provider |

## Translation Providers

| Provider | API Key Required | Plan | Status |
|----------|-----------------|------|--------|
| DeepL | `DEEPL_API_KEY` | Premium/Luxe | TODO: Real developer configures key |
| Google Translate | `GOOGLE_TRANSLATE_API_KEY` | Pro+ | TODO: Real developer configures key |
| OpenAI GPT | `OPENAI_API_KEY` | Any | TODO: Real developer configures key |
| Demo | None | Any | Always available — `[LANG] prefix` |

## Environment Variables

```env
# Translation
DEEPL_API_KEY=              # DeepL Pro API key (https://www.deepl.com/pro-api)
GOOGLE_TRANSLATE_API_KEY=   # Google Cloud Translation API key
OPENAI_API_KEY=             # OpenAI API key (for GPT translation + descriptions)
OPENAI_BASE_URL=            # Optional proxy URL

# OCR (placeholder — choose one)
# GOOGLE_CLOUD_VISION_API_KEY=   # Google Cloud Vision
# AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=  # Azure
# (Tesseract.js: npm install tesseract.js — no key needed)
```

## TODO for Real Developer

### High Priority
1. **Get API keys** — DeepL, Google Translate, and/or OpenAI keys for real translations
2. **OCR Implementation** — Choose and implement OCR provider in `src/app/api/transformer/ocr/route.ts`:
   - **Recommended:** GPT-4 Vision (best accuracy, ~$0.01-0.05/image)
   - **Alternative:** Google Cloud Vision (~$1.50/1000 images)
   - **Free:** Tesseract.js (lower accuracy)
3. **DALL-E Integration** — Requires direct OpenAI key (not proxy). Consider caching generated images in Supabase Storage (DALL-E URLs expire after ~1 hour)
4. **OCR → Auto-import** — Wire OCR results to auto-create dishes/categories via existing CRUD APIs

### Medium Priority
5. **Translation cache** — Cache translations in DB to avoid re-translating same content
6. **Rate limiting** — Add rate limits per restaurant/plan to prevent abuse
7. **Cost estimation** — Show estimated cost before running expensive operations
8. **Batch import** — Allow importing OCR results as dishes with one click

### Low Priority
9. **Translation review workflow** — Allow owner to review/edit translations before saving
10. **Custom glossary** — Restaurant-specific translation glossary for consistent terminology
11. **Image style customization** — More DALL-E style options, custom prompts

## Database

### New Table: `transformer_usage`
```sql
CREATE TABLE transformer_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,        -- 'translation' | 'description' | 'image' | 'ocr'
  provider TEXT NOT NULL,    -- 'deepl' | 'google' | 'openai' | 'dalle' | 'demo'
  tokens_used INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Prisma Model: `TransformerUsage`
- Indexes on `restaurantId`, `type`, `createdAt`
- RLS: owners see own usage, service role can insert

## UI Features

### Translations Page (`/dashboard/translations`)
- **4 Tabs:** Translate Menu, AI Descriptions, OCR Import, Statistics
- **Menu Translation:** Select menu → select languages (33 supported) → batch translate
- **AI Descriptions:** Per-dish or batch generation with style selection (appetizing/concise/detailed/poetic)
- **Image Generation:** Per-dish DALL-E image generation button
- **OCR Import:** Image URL input → extract structured menu data (demo mode)
- **Usage Stats:** KPI cards, provider breakdown, type breakdown, recent activity log
- **Provider Status Bar:** Shows available providers and configuration hints

## Feature Flag

```typescript
FF_TRANSFORMER: {
  description: 'AI-powered menu translation and description generation',
  scopes: ['global', 'restaurant', 'plan'],
  defaultValue: false,
  minPlan: 'premium',
}
```

## Statistics

- **New API endpoints:** 5 (total: 30)
- **New Prisma model:** 1 (TransformerUsage)
- **New Zod validators:** 4 (TranslateRequest, DescribeRequest, ImageGenerateRequest, OcrRequest)
- **Supported languages:** 33
- **Translation providers:** 4 (DeepL, Google, OpenAI, Demo)
- **Description styles:** 4 (appetizing, concise, detailed, poetic)
- **Image styles:** 3 (photo, illustration, watercolor)

## Rollback

1. Remove `TransformerUsage` from `prisma/schema.prisma`
2. Delete `src/app/api/transformer/` directory
3. Delete `src/app/dashboard/translations/` directory
4. Remove `useTransformer` from `src/hooks/index.ts`
5. Remove transformer schemas from `src/lib/validators.ts`
6. Remove transformer types from `src/types/index.ts`
7. Revert navigation and middleware changes
8. Run `DROP TABLE IF EXISTS transformer_usage;`
