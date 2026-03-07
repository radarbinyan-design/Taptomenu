import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { processMenuImage, validateImage, generateImageFilenames } from '@/lib/image-processing'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const restaurantId = formData.get('restaurantId') as string
    const dishId = formData.get('dishId') as string

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const validation = await validateImage(buffer)

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { lg, md, sm } = await processMenuImage(buffer, file.name)
    const filenames = generateImageFilenames(restaurantId, dishId || Date.now().toString(), file.name)

    // Upload to Supabase Storage
    const uploads = await Promise.all([
      supabaseAdmin.storage.from('menu-images').upload(filenames.lg, lg, {
        contentType: 'image/webp',
        upsert: true,
      }),
      supabaseAdmin.storage.from('menu-images').upload(filenames.md, md, {
        contentType: 'image/webp',
        upsert: true,
      }),
      supabaseAdmin.storage.from('menu-images').upload(filenames.sm, sm, {
        contentType: 'image/webp',
        upsert: true,
      }),
    ])

    const errors = uploads.filter((u) => u.error)
    if (errors.length > 0) {
      console.error('Upload errors:', errors)
      return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 })
    }

    // Get public URLs
    const { data: { publicUrl: imageUrl } } = supabaseAdmin.storage
      .from('menu-images')
      .getPublicUrl(filenames.lg)
    const { data: { publicUrl: imageUrlMd } } = supabaseAdmin.storage
      .from('menu-images')
      .getPublicUrl(filenames.md)
    const { data: { publicUrl: imageUrlSm } } = supabaseAdmin.storage
      .from('menu-images')
      .getPublicUrl(filenames.sm)

    return NextResponse.json({
      imageUrl,
      imageUrlMd,
      imageUrlSm,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Ошибка обработки изображения' }, { status: 500 })
  }
}

// Next.js 14 App Router: no need for config export
// File size limit is configured via next.config.js if needed
