/**
 * Health check endpoints for monitoring and load balancers
 */

import { Router } from 'express'
import mongoose from 'mongoose'
import logger from '../logger.ts'

const router = Router()

/**
 * Basic health check - returns 200 OK if server is running
 * Used by: Load balancers, uptime monitors
 */
router.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

/**
 * Detailed health check - includes system metrics
 * Used by: Monitoring dashboards, alerting systems
 */
router.get('/detailed', async (_req, res) => {
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: { status: 'disconnected', responseTime: 0 },
    memory: { used: 0, percentage: 0, total: 0 },
  }

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      const start = Date.now()
      await mongoose.connection.db.admin().ping()
      health.database.responseTime = Date.now() - start
      health.database.status = 'connected'
    } else {
      health.status = 'unhealthy'
      health.database.status = 'disconnected'
    }
  } catch (error) {
    logger.error('Health check database ping failed', { error })
    health.status = 'unhealthy'
    health.database.status = 'error'
    health.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Memory usage
  const memUsage = process.memoryUsage()
  health.memory.used = Math.round(memUsage.heapUsed / 1024 / 1024) // MB
  health.memory.total = Math.round(memUsage.heapTotal / 1024 / 1024) // MB
  health.memory.percentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 503
  res.status(statusCode).json(health)
})

/**
 * Readiness check - checks if app is ready to receive traffic
 * Used by: Kubernetes, Docker Swarm
 */
router.get('/ready', async (_req, res) => {
  // Check if database is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      ready: false,
      reason: 'Database not connected',
    })
  }

  res.status(200).json({ ready: true })
})

/**
 * Liveness check - checks if app is alive (not deadlocked)
 * Used by: Kubernetes, Docker Swarm
 */
router.get('/live', (_req, res) => {
  res.status(200).json({ alive: true })
})

export default router
