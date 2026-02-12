import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { exercises } from '../exercises/schema'
import { courses } from '../courses/schema'
import { lessons } from '../lessons/schema'
import { userNotes } from '../notes/schema'
import { authMiddleware } from '../../middleware/auth'
import { SYSTEM_PROMPT, buildGeneratePrompt, buildEnhancePrompt, buildMultiNotesPrompt, buildTopicPrompt } from './prompts'

export const aiRoutes = new Hono<AppEnv>()

const generateSchema = z.object({
  text: z.string().min(10).max(10000),
  lessonId: z.string().uuid(),
})

const notesQuizSchema = z.object({
  noteIds: z.array(z.string()).min(1).max(5),
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

async function callAIText(ai: Ai, userPrompt: string): Promise<string> {
  const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'You are a helpful educational assistant. Return plain text only, no JSON or markdown formatting.' },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  })
  return ((response as { response?: string }).response || '').trim()
}

// POST /api/ai/enhance-note — AI expands a note with deeper explanations
aiRoutes.post('/enhance-note', authMiddleware, async (c) => {
  const body = await c.req.json()
  const { noteId } = z.object({ noteId: z.string() }).parse(body)

  const userId = c.get('user').id
  const db = createDb(c.env.DB)

  const note = await db.select().from(userNotes)
    .where(and(eq(userNotes.id, noteId), eq(userNotes.userId, userId))).get()
  if (!note) return c.json({ error: 'Note not found' }, 404)

  if (note.enhancedContent) {
    return c.json({ enhancedContent: note.enhancedContent })
  }

  try {
    const enhanced = await callAIText(c.env.AI, buildEnhancePrompt(note.content))
    if (!enhanced) throw new Error('Empty response from AI')

    await db.update(userNotes)
      .set({ enhancedContent: enhanced, updatedAt: new Date() })
      .where(eq(userNotes.id, noteId))

    return c.json({ enhancedContent: enhanced })
  } catch (err) {
    return c.json({ error: 'Enhancement failed', details: String(err) }, 500)
  }
})

// POST /api/ai/generate-exercises — freeform text → exercises
aiRoutes.post('/generate-exercises', authMiddleware, async (c) => {
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

// POST /api/ai/notes-quiz — select 1-5 notes, auto-create course+lesson, generate quiz
aiRoutes.post('/notes-quiz', authMiddleware, async (c) => {
  const body = await c.req.json()
  const parsed = notesQuizSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const userId = c.get('user').id
  const db = createDb(c.env.DB)
  const now = new Date()

  // Fetch all selected notes, verify ownership
  const notes = []
  for (const noteId of parsed.data.noteIds) {
    const note = await db.select().from(userNotes)
      .where(and(eq(userNotes.id, noteId), eq(userNotes.userId, userId))).get()
    if (!note) return c.json({ error: `Note ${noteId} not found` }, 404)
    notes.push(note)
  }

  // Find-or-create per-user "My Notes" course (title encodes userId for isolation)
  const myNotesTitle = `My Notes [${userId}]`
  let course = await db.select().from(courses)
    .where(eq(courses.title, myNotesTitle)).get()
  if (!course) {
    const courseId = crypto.randomUUID()
    await db.insert(courses).values({
      id: courseId, title: myNotesTitle,
      description: 'Quizzes generated from your personal notes',
      difficulty: 'beginner', icon: '📝', color: '#8B5CF6',
      published: true, createdAt: now, updatedAt: now,
    })
    course = { id: courseId } as typeof course
  }

  // Create lesson — title from note titles
  const lessonTitle = notes.length === 1
    ? notes[0].title
    : notes.slice(0, 3).map((n) => n.title).join(' & ')
  const lessonId = crypto.randomUUID()
  await db.insert(lessons).values({
    id: lessonId, courseId: course!.id, title: lessonTitle,
    description: `Quiz from your notes`, published: true,
    createdAt: now, updatedAt: now,
  })

  try {
    const items = await callAI(
      c.env.AI,
      buildMultiNotesPrompt(notes.map((n) => ({ title: n.title, content: n.content }))),
    )

    // Save exercises as published (personal content, no review needed)
    const ids: string[] = []
    for (const item of items) {
      const obj = item as { type?: string; content?: unknown }
      if (!obj.type || !obj.content) continue
      const id = crypto.randomUUID()
      await db.insert(exercises).values({
        id, lessonId,
        type: obj.type as typeof exercises.$inferInsert.type,
        content: JSON.stringify(obj.content),
        status: 'published', createdAt: now, updatedAt: now,
      })
      ids.push(id)
    }

    if (ids.length === 0) {
      await db.delete(lessons).where(eq(lessons.id, lessonId))
      return c.json({ error: 'AI could not generate exercises from this content. Try adding more detail.' }, 500)
    }

    // Backlink: update each note's lessonId so "Play Again" works
    for (const note of notes) {
      await db.update(userNotes)
        .set({ lessonId, updatedAt: now })
        .where(eq(userNotes.id, note.id))
    }

    return c.json({ lessonId, courseId: course!.id, exerciseCount: ids.length }, 201)
  } catch (err) {
    await db.delete(lessons).where(eq(lessons.id, lessonId))
    return c.json({ error: 'AI generation failed', details: String(err) }, 500)
  }
})

// POST /api/ai/learn — student picks a topic, AI generates exercises
const learnSchema = z.object({
  topic: z.string().min(3).max(200),
})

aiRoutes.post('/learn', authMiddleware, async (c) => {
  const body = await c.req.json()
  const parsed = learnSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const { topic } = parsed.data
  const db = createDb(c.env.DB)
  const now = new Date()

  // Find or create "Student Topics" course
  let course = await db.select().from(courses)
    .where(eq(courses.title, 'Student Topics')).get()

  if (!course) {
    const courseId = crypto.randomUUID()
    await db.insert(courses).values({
      id: courseId,
      title: 'Student Topics',
      description: 'Auto-generated lessons from student topic requests',
      difficulty: 'beginner',
      icon: '🎯',
      color: '#8B5CF6',
      published: true,
      createdAt: now,
      updatedAt: now,
    })
    course = { id: courseId, title: 'Student Topics', description: '', difficulty: 'beginner' as const, icon: '🎯', color: '#8B5CF6', sortOrder: 0, published: true, createdAt: now, updatedAt: now }
  }

  // Create lesson for this topic
  const lessonId = crypto.randomUUID()
  await db.insert(lessons).values({
    id: lessonId,
    courseId: course.id,
    title: topic,
    description: `AI-generated exercises about: ${topic}`,
    published: true,
    createdAt: now,
    updatedAt: now,
  })

  try {
    const items = await callAI(c.env.AI, buildTopicPrompt(topic))

    // Save exercises as published (auto-approved for student content)
    const ids: string[] = []
    for (const item of items) {
      const obj = item as { type?: string; content?: unknown }
      if (!obj.type || !obj.content) continue

      const id = crypto.randomUUID()
      await db.insert(exercises).values({
        id,
        lessonId,
        type: obj.type as typeof exercises.$inferInsert.type,
        content: JSON.stringify(obj.content),
        status: 'published',
        createdAt: now,
        updatedAt: now,
      })
      ids.push(id)
    }

    return c.json({ lessonId, courseId: course.id, exerciseCount: ids.length }, 201)
  } catch (err) {
    // Cleanup: delete the lesson on AI failure
    await db.delete(lessons).where(eq(lessons.id, lessonId))
    return c.json({ error: 'AI generation failed', details: String(err) }, 500)
  }
})

// GET /api/ai/pending — list pending review exercises
aiRoutes.get('/pending', authMiddleware, async (c) => {
  const db = createDb(c.env.DB)
  const rows = await db.select().from(exercises)
    .where(eq(exercises.status, 'pending_review')).all()
  return c.json({ exercises: rows })
})

// PUT /api/ai/approve/:id — publish a pending exercise
aiRoutes.put('/approve/:id', authMiddleware, async (c) => {
  const db = createDb(c.env.DB)
  await db.update(exercises)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(exercises.id, c.req.param('id')))
  return c.json({ ok: true })
})
