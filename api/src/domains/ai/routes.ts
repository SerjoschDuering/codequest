import { Hono } from 'hono'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { exercises } from '../exercises/schema'
import { userNotes } from '../notes/schema'
import { authMiddleware } from '../../middleware/auth'
import { SYSTEM_PROMPT, buildGeneratePrompt, buildNotesPrompt } from './prompts'

export const aiRoutes = new Hono<AppEnv>()

const generateSchema = z.object({
  text: z.string().min(10).max(10000),
  lessonId: z.string().uuid(),
})

const notesToExercisesSchema = z.object({
  noteId: z.string(),
  lessonId: z.string().uuid().optional(),
})

async function callAI(ai: Ai, userPrompt: string): Promise<unknown[]> {
  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2048,
    temperature: 0.7,
  })

  const text = (response as { response?: string }).response || ''

  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('AI did not return valid JSON array')

  return JSON.parse(jsonMatch[0])
}

async function saveExercises(
  db: ReturnType<typeof createDb>,
  items: unknown[],
  lessonId: string,
) {
  const ids: string[] = []
  const now = new Date()

  for (const item of items) {
    const obj = item as { type?: string; content?: unknown }
    if (!obj.type || !obj.content) continue

    const id = crypto.randomUUID()
    await db.insert(exercises).values({
      id,
      lessonId,
      type: obj.type as typeof exercises.$inferInsert.type,
      content: JSON.stringify(obj.content),
      status: 'pending_review',
      createdAt: now,
      updatedAt: now,
    })
    ids.push(id)
  }
  return ids
}

// POST /api/ai/generate-exercises — freeform text → exercises
aiRoutes.post('/generate-exercises', async (c) => {
  const body = await c.req.json()
  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  try {
    const items = await callAI(c.env.AI, buildGeneratePrompt(parsed.data.text))
    const db = createDb(c.env.DB)
    const ids = await saveExercises(db, items, parsed.data.lessonId)
    return c.json({ generated: ids.length, exerciseIds: ids })
  } catch (err) {
    return c.json({ error: 'AI generation failed', details: String(err) }, 500)
  }
})

// POST /api/ai/notes-to-exercises — convert note to exercises
aiRoutes.post('/notes-to-exercises', authMiddleware, async (c) => {
  const body = await c.req.json()
  const parsed = notesToExercisesSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const userId = c.get('user').id
  const db = createDb(c.env.DB)

  const note = await db.select().from(userNotes)
    .where(eq(userNotes.id, parsed.data.noteId)).get()
  if (!note || note.userId !== userId) {
    return c.json({ error: 'Note not found' }, 404)
  }

  const lessonId = parsed.data.lessonId || note.lessonId
  if (!lessonId) {
    return c.json({ error: 'No lessonId provided and note has no linked lesson' }, 400)
  }

  try {
    const items = await callAI(c.env.AI, buildNotesPrompt(note.content))
    const ids = await saveExercises(db, items, lessonId)
    return c.json({ generated: ids.length, exerciseIds: ids })
  } catch (err) {
    return c.json({ error: 'AI generation failed', details: String(err) }, 500)
  }
})

// GET /api/ai/pending — list pending review exercises
aiRoutes.get('/pending', async (c) => {
  const db = createDb(c.env.DB)
  const rows = await db.select().from(exercises)
    .where(eq(exercises.status, 'pending_review')).all()
  return c.json({ exercises: rows })
})

// PUT /api/ai/approve/:id — publish a pending exercise
aiRoutes.put('/approve/:id', async (c) => {
  const db = createDb(c.env.DB)
  await db.update(exercises)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(exercises.id, c.req.param('id')))
  return c.json({ ok: true })
})
