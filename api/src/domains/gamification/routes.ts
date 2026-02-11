import { Hono } from 'hono'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { authMiddleware } from '../../middleware/auth'
import { getUserStats } from './service'
import { getLeaderboard, getUserRank } from './leaderboard'

export const gamificationRoutes = new Hono<AppEnv>()

gamificationRoutes.use('*', authMiddleware)

gamificationRoutes.get('/me', async (c) => {
  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  const stats = await getUserStats(db, userId)
  return c.json(stats)
})

gamificationRoutes.get('/leaderboard', async (c) => {
  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  const limit = Math.min(Number(c.req.query('limit') || 50), 100)

  const entries = await getLeaderboard(db, limit)
  const myRank = await getUserRank(db, userId)

  return c.json({ entries, myRank, userId })
})
