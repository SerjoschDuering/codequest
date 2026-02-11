import { Hono } from 'hono'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { exercises } from './schema'
import { exerciseContentSchema } from './types'

export const exercisesRoutes = new Hono<AppEnv>()

const exerciseTypes = [
  'multiple_choice', 'code_completion', 'matching', 'sequencing',
  'fill_in_blank', 'diagram_quiz', 'guess_output', 'spot_the_bug', 'acronym_challenge',
] as const

const createExerciseSchema = z.object({
  lessonId: z.string().uuid(),
  type: z.enum(exerciseTypes),
  content: z.string(), // JSON string — validated below
  difficulty: z.number().int().min(1).max(5).optional(),
  xpReward: z.number().int().min(0).optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(['draft', 'pending_review', 'published']).optional(),
})

function validateContent(type: string, contentStr: string) {
  try {
    const data = JSON.parse(contentStr)
    return exerciseContentSchema.safeParse({ type, data })
  } catch {
    return { success: false as const, error: { message: 'Invalid JSON' } }
  }
}

exercisesRoutes.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const lessonId = c.req.query('lessonId')
  const rows = lessonId
    ? await db.select().from(exercises).where(eq(exercises.lessonId, lessonId)).all()
    : await db.select().from(exercises).all()
  return c.json({ exercises: rows })
})

exercisesRoutes.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const row = await db.select().from(exercises).where(eq(exercises.id, c.req.param('id'))).get()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json({ exercise: row })
})

exercisesRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createExerciseSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const contentResult = validateContent(parsed.data.type, parsed.data.content)
  if (!contentResult.success) {
    return c.json({ error: 'Invalid exercise content', details: contentResult.error }, 400)
  }

  const db = createDb(c.env.DB)
  const now = new Date()
  const id = crypto.randomUUID()
  await db.insert(exercises).values({ id, ...parsed.data, createdAt: now, updatedAt: now })
  return c.json({ id }, 201)
})

exercisesRoutes.put('/:id', async (c) => {
  const body = await c.req.json()
  const parsed = createExerciseSchema.partial().safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  if (parsed.data.type && parsed.data.content) {
    const contentResult = validateContent(parsed.data.type, parsed.data.content)
    if (!contentResult.success) {
      return c.json({ error: 'Invalid exercise content', details: contentResult.error }, 400)
    }
  }

  const db = createDb(c.env.DB)
  await db.update(exercises)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(exercises.id, c.req.param('id')))
  return c.json({ ok: true })
})

exercisesRoutes.delete('/:id', async (c) => {
  const db = createDb(c.env.DB)
  await db.delete(exercises).where(eq(exercises.id, c.req.param('id')))
  return c.json({ ok: true })
})
