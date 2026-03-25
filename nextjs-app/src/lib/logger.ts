/**
 * TapMenu Armenia — Structured Logger
 *
 * Safe, structured logging utility for server-side and edge runtime.
 * Outputs JSON in production, human-readable in development.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *
 *   logger.info('Dish created', { dishId: '...', restaurantId: '...' })
 *   logger.warn('Rate limit approaching', { ip: '...', count: 9 })
 *   logger.error('Database query failed', { error, query: 'getDish' })
 *
 * Rules:
 *   - Never log sensitive data (passwords, tokens, API keys, PII)
 *   - Always include contextual metadata (IDs, action names)
 *   - Use appropriate log levels
 *   - Keep log messages short and searchable
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  module?: string
  [key: string]: unknown
}

type LogMeta = Record<string, unknown>

// ─── Configuration ────────────────────────────────────────────────────────────

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function getMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL as LogLevel | undefined
  if (env && env in LOG_LEVELS) return env
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// ─── Sensitive Data Filter ────────────────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'creditCard',
  'credit_card',
  'ssn',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'private_key',
  'privateKey',
])

function sanitizeMeta(meta: LogMeta): LogMeta {
  const sanitized: LogMeta = {}

  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase().replace(/[-_]/g, ''))) {
      sanitized[key] = '[REDACTED]'
    } else if (value instanceof Error) {
      sanitized[key] = {
        name: value.name,
        message: value.message,
        stack: IS_PRODUCTION ? undefined : value.stack,
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMeta(value as LogMeta)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry)
}

function formatDev(entry: LogEntry): string {
  const { timestamp, level, message, module: mod, ...rest } = entry
  const prefix = mod ? `[${mod}]` : ''
  const levelColor: Record<LogLevel, string> = {
    debug: '\x1b[36m', // cyan
    info: '\x1b[32m',  // green
    warn: '\x1b[33m',  // yellow
    error: '\x1b[31m', // red
  }
  const reset = '\x1b[0m'
  const metaStr = Object.keys(rest).length > 0
    ? ` ${JSON.stringify(rest)}`
    : ''
  return `${levelColor[level]}${level.toUpperCase().padEnd(5)}${reset} ${timestamp} ${prefix} ${message}${metaStr}`
}

// ─── Logger Class ─────────────────────────────────────────────────────────────

class Logger {
  private module?: string

  constructor(module?: string) {
    this.module = module
  }

  private log(level: LogLevel, message: string, meta: LogMeta = {}): void {
    const minLevel = getMinLevel()
    if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(this.module ? { module: this.module } : {}),
      ...sanitizeMeta(meta),
    }

    const formatted = IS_PRODUCTION ? formatJson(entry) : formatDev(entry)

    switch (level) {
      case 'error':
        console.error(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'debug':
        console.debug(formatted)
        break
      default:
        console.log(formatted)
    }
  }

  debug(message: string, meta?: LogMeta): void {
    this.log('debug', message, meta)
  }

  info(message: string, meta?: LogMeta): void {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: LogMeta): void {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: LogMeta): void {
    this.log('error', message, meta)
  }

  /**
   * Create a child logger with a module name prefix.
   *
   * @example
   *   const log = logger.child('dishes-api')
   *   log.info('Dish created', { dishId: '...' })
   *   // Output: INFO [dishes-api] Dish created {"dishId":"..."}
   */
  child(module: string): Logger {
    return new Logger(
      this.module ? `${this.module}:${module}` : module
    )
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

/** Global logger instance. Use `logger.child('module')` for scoped logging. */
export const logger = new Logger()
