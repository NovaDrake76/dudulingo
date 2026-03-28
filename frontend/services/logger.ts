type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel = __DEV__ ? 'debug' : 'warn'

function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return

  const timestamp = formatTimestamp()
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`
  const metaStr = meta ? ` ${JSON.stringify(meta, null, 0)}` : ''

  switch (level) {
    case 'error':
      console.error(`${prefix} ${message}${metaStr}`)
      break
    case 'warn':
      console.warn(`${prefix} ${message}${metaStr}`)
      break
    default:
      console.log(`${prefix} ${message}${metaStr}`)
  }
}

const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
}

export default logger
