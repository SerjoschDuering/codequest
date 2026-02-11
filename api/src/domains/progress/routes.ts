import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { userProgress } from './schema'
import { exercises } from '../exercises/schema'
import { authMiddleware } from '../../middleware/auth'
import { awardXp, updateStreak } from '../gamification/service'

export const progressRoutes = new Hono<AppEnv>()

const submitSchema = z.object({
  exerciseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  answer: z.unknown(),
  correct: z.boolean(),
})

// All progress routes require auth
progressRoutes.use('*', authMiddleware)

progressRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  const now = new Date()
  const id = crypto.randomUUID()

  // Get exercise XP reward
  const exercise = await db.select().from(exercises)
    .where(eq(exercises.id, parsed.data.exerciseId)).get()
  const xpEarned = parsed.data.correct ? (exercise?.xpReward ?? 10) : 0

  // Record attempt
  await db.insert(userProgress).values({
    id,
    userId,
    exerciseId: parsed.data.exerciseId,
    lessonId: parsed.data.lessonId,
    correct: parsed.data.correct,
    answer: JSON.stringify(parsed.data.answer),
    xpEarned,
    attemptedAt: now,
  })

  // Award XP + update streak
  let xpResult = { totalXp: 0, level: 1, leveledUp: false }
  let streakResult = { currentStreak: 0, longestStreak: 0 }
  if (parsed.data.correct) {
    xpResult = await awardXp(db, userId, xpEarned)
    streakResult = await updateStreak(db, userId)
  }

  return c.json({
    correct: parsed.data.correct,
    xpEarned,
    ...xpResult,
    ...streakResult,
  })
})

progressRoutes.get('/', async (c) => {
  const userId = c.get('user').id
  const lessonId = c.req.query('lessonId')
  const db = createDb(c.env.DB)

  const condition = lessonId
    ? and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId))
    : eq(userProgress.userId, userId)

  const rows = await db.select().from(userProgress).where(condition).all()
  return c.json({ progress: rows })
})
