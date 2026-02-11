import { Hono } from 'hono'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { courses } from './schema'

export const coursesRoutes = new Hono<AppEnv>()

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
})

coursesRoutes.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const rows = await db.select().from(courses).all()
  return c.json({ courses: rows })
})

coursesRoutes.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const row = await db.select().from(courses).where(eq(courses.id, c.req.param('id'))).get()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json({ course: row })
})

coursesRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createCourseSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = createDb(c.env.DB)
  const now = new Date()
  const id = crypto.randomUUID()
  await db.insert(courses).values({ id, ...parsed.data, createdAt: now, updatedAt: now })
  return c.json({ id }, 201)
})

coursesRoutes.put('/:id', async (c) => {
  const body = await c.req.json()
  const parsed = createCourseSchema.partial().safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = createDb(c.env.DB)
  await db.update(courses)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(courses.id, c.req.param('id')))
  return c.json({ ok: true })
})

coursesRoutes.delete('/:id', async (c) => {
  const db = createDb(c.env.DB)
  await db.delete(courses).where(eq(courses.id, c.req.param('id')))
  return c.json({ ok: true })
})
