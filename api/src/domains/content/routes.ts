import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../../index'
import { createDb } from '../../db'
import { courses } from '../courses/schema'
import { lessons } from '../lessons/schema'
import { exercises } from '../exercises/schema'

const EXERCISE_TYPES = [
  'multiple_choice', 'code_completion', 'matching', 'sequencing',
  'fill_in_blank', 'diagram_quiz', 'guess_output', 'spot_the_bug',
  'acronym_challenge',
] as const

const exerciseInput = z.object({
  type: z.enum(EXERCISE_TYPES),
  content: z.record(z.unknown()),
  difficulty: z.number().int().min(1).max(5).optional(),
  xpReward: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(['draft', 'pending_review', 'published']).optional(),
})

const lessonInput = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  xpReward: z.number().int().optional(),
  published: z.boolean().optional(),
  exercises: z.array(exerciseInput).optional(),
})

const courseInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().default(''),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
  lessons: z.array(lessonInput).optional(),
})

const bulkSchema = z.object({
  courses: z.array(courseInput).optional(),
  lessons: z.array(lessonInput).optional(),
  exercises: z.array(exerciseInput.extend({ lessonId: z.string().uuid() })).optional(),
})

export const contentRoutes = new Hono<AppEnv>()

contentRoutes.post('/bulk', async (c) => {
  const body = await c.req.json()
  const parsed = bulkSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const db = createDb(c.env.DB)
  const now = new Date()
  const created = { courseIds: [] as string[], lessonIds: [] as string[], exerciseIds: [] as string[] }
  const errors: { path: string; message: string }[] = []

  async function insertExercise(lessonId: string, ex: z.infer<typeof exerciseInput>, path: string) {
    try {
      const id = crypto.randomUUID()
      await db.insert(exercises).values({
        id,
        lessonId,
        type: ex.type,
        content: JSON.stringify(ex.content),
        difficulty: ex.difficulty ?? 1,
        xpReward: ex.xpReward ?? 10,
        sortOrder: ex.sortOrder ?? 0,
        status: ex.status ?? 'published',
        createdAt: now,
        updatedAt: now,
      })
      created.exerciseIds.push(id)
    } catch (err) {
      errors.push({ path, message: String(err) })
    }
  }

  async function insertLesson(courseId: string, lesson: z.infer<typeof lessonInput>, path: string) {
    try {
      const id = crypto.randomUUID()
      await db.insert(lessons).values({
        id,
        courseId,
        title: lesson.title,
        description: lesson.description ?? null,
        sortOrder: lesson.sortOrder ?? 0,
        xpReward: lesson.xpReward ?? 50,
        published: lesson.published ?? false,
        createdAt: now,
        updatedAt: now,
      })
      created.lessonIds.push(id)

      if (lesson.exercises) {
        for (let k = 0; k < lesson.exercises.length; k++) {
          await insertExercise(id, lesson.exercises[k], `${path}.exercises[${k}]`)
        }
      }
    } catch (err) {
      errors.push({ path, message: String(err) })
    }
  }

  // 1. Nested courses → lessons → exercises
  if (parsed.data.courses) {
    for (let i = 0; i < parsed.data.courses.length; i++) {
      const course = parsed.data.courses[i]
      const path = `courses[${i}]`
      try {
        const id = crypto.randomUUID()
        await db.insert(courses).values({
          id,
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          icon: course.icon ?? null,
          color: course.color ?? null,
          sortOrder: course.sortOrder ?? 0,
          published: course.published ?? false,
          createdAt: now,
          updatedAt: now,
        })
        created.courseIds.push(id)

        if (course.lessons) {
          for (let j = 0; j < course.lessons.length; j++) {
            await insertLesson(id, course.lessons[j], `${path}.lessons[${j}]`)
          }
        }
      } catch (err) {
        errors.push({ path, message: String(err) })
      }
    }
  }

  // 2. Flat lessons (with courseId pointing to existing course)
  if (parsed.data.lessons) {
    for (let i = 0; i < parsed.data.lessons.length; i++) {
      const lesson = parsed.data.lessons[i]
      const path = `lessons[${i}]`
      if (!lesson.courseId) {
        errors.push({ path, message: 'courseId required for top-level lessons' })
        continue
      }
      await insertLesson(lesson.courseId, lesson, path)
    }
  }

  // 3. Flat exercises (with lessonId pointing to existing lesson)
  if (parsed.data.exercises) {
    for (let i = 0; i < parsed.data.exercises.length; i++) {
      const ex = parsed.data.exercises[i]
      await insertExercise(ex.lessonId, ex, `exercises[${i}]`)
    }
  }

  const total = created.courseIds.length + created.lessonIds.length + created.exerciseIds.length
  if (total === 0 && errors.length > 0) {
    return c.json({ created, errors }, 400)
  }

  const status = errors.length > 0 ? 207 : 201
  return c.json({ created, ...(errors.length > 0 ? { errors } : {}) }, status)
})
