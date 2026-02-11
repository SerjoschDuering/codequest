import { Hono } from 'hono'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { lessons } from './schema'

export const lessonsRoutes = new Hono<AppEnv>()

const createLessonSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  xpReward: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
})

lessonsRoutes.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const courseId = c.req.query('courseId')
  const rows = courseId
    ? await db.select().from(lessons).where(eq(lessons.courseId, courseId)).all()
    : await db.select().from(lessons).all()
  return c.json({ lessons: rows })
})

lessonsRoutes.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const row = await db.select().from(lessons).where(eq(lessons.id, c.req.param('id'))).get()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json({ lesson: row })
})

lessonsRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createLessonSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = createDb(c.env.DB)
  const now = new Date()
  const id = crypto.randomUUID()
  await db.insert(lessons).values({ id, ...parsed.data, createdAt: now, updatedAt: now })
  return c.json({ id }, 201)
})

lessonsRoutes.put('/:id', async (c) => {
  const body = await c.req.json()
  const parsed = createLessonSchema.partial().safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = createDb(c.env.DB)
  await db.update(lessons)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(lessons.id, c.req.param('id')))
  return c.json({ ok: true })
})

lessonsRoutes.delete('/:id', async (c) => {
  const db = createDb(c.env.DB)
  await db.delete(lessons).where(eq(lessons.id, c.req.param('id')))
  return c.json({ ok: true })
})
