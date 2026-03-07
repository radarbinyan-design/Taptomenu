import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.WIFI_ENCRYPTION_KEY! // 32 bytes hex string
const IV_LENGTH = 16

export function encryptWifiPassword(password: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

export function decryptWifiPassword(encryptedData: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const [ivHex, encrypted] = encryptedData.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// Sanitize restaurant slug: only a-z, 0-9, hyphen
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

// Generate unique slug from restaurant name
export async function generateUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = sanitizeSlug(name)
  let slug = base
  let counter = 1

  while (await checkExists(slug)) {
    slug = `${base}-${counter}`
    counter++
  }

  return slug
}

// Rate limiting helper (simple in-memory, use Upstash Redis for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
