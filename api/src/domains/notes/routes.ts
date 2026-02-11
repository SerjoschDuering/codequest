import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { userNotes } from './schema'
import { authMiddleware } from '../../middleware/auth'

export const notesRoutes = new Hono<AppEnv>()

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  lessonId: z.string().uuid().optional(),
})

notesRoutes.use('*', authMiddleware)

notesRoutes.get('/', async (c) => {
  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  const rows = await db.select().from(userNotes).where(eq(userNotes.userId, userId)).all()
  return c.json({ notes: rows })
})

notesRoutes.get('/:id', async (c) => {
  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  const row = await db.select().from(userNotes)
    .where(and(eq(userNotes.id, c.req.param('id')), eq(userNotes.userId, userId))).get()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json({ note: row })
})

notesRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createNoteSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  const now = new Date()
  const id = crypto.randomUUID()
  await db.insert(userNotes).values({ id, userId, ...parsed.data, createdAt: now, updatedAt: now })
  return c.json({ id }, 201)
})

notesRoutes.put('/:id', async (c) => {
  const body = await c.req.json()
  const parsed = createNoteSchema.partial().safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  await db.update(userNotes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(userNotes.id, c.req.param('id')), eq(userNotes.userId, userId)))
  return c.json({ ok: true })
})

notesRoutes.delete('/:id', async (c) => {
  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  await db.delete(userNotes)
    .where(and(eq(userNotes.id, c.req.param('id')), eq(userNotes.userId, userId)))
  return c.json({ ok: true })
})
