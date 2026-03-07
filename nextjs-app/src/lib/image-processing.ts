import sharp from 'sharp'

export const IMAGE_SIZES = {
  lg: { width: 1200, height: 800 },
  md: { width: 600, height: 400 },
  sm: { width: 300, height: 200 },
}

export async function processMenuImage(
  inputBuffer: Buffer,
  filename: string
): Promise<{
  lg: Buffer
  md: Buffer
  sm: Buffer
}> {
  const [lg, md, sm] = await Promise.all([
    sharp(inputBuffer)
      .resize(IMAGE_SIZES.lg.width, IMAGE_SIZES.lg.height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toBuffer(),
    sharp(inputBuffer)
      .resize(IMAGE_SIZES.md.width, IMAGE_SIZES.md.height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer(),
    sharp(inputBuffer)
      .resize(IMAGE_SIZES.sm.width, IMAGE_SIZES.sm.height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75 })
      .toBuffer(),
  ])

  return { lg, md, sm }
}

export async function processRestaurantLogo(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(400, 400, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90 })
    .toBuffer()
}

export function generateImageFilenames(
  restaurantId: string,
  dishId: string,
  originalFilename: string
): {
  lg: string
  md: string
  sm: string
} {
  const ext = '.webp'
  const base = `restaurants/${restaurantId}/dishes/${dishId}`
  return {
    lg: `${base}/original${ext}`,
    md: `${base}/medium${ext}`,
    sm: `${base}/thumb${ext}`,
  }
}

export async function validateImage(buffer: Buffer): Promise<{
  valid: boolean
  error?: string
  metadata?: sharp.Metadata
}> {
  try {
    const metadata = await sharp(buffer).metadata()
    
    if (!['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(metadata.format || '')) {
      return { valid: false, error: 'Неподдерживаемый формат изображения' }
    }
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (buffer.length > maxSize) {
      return { valid: false, error: 'Файл слишком большой (максимум 10MB)' }
    }
    
    return { valid: true, metadata }
  } catch {
    return { valid: false, error: 'Недействительный файл изображения' }
  }
}
