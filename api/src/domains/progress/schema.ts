import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { user } from '../auth/auth.schema'
import { exercises } from '../exercises/schema'
import { lessons } from '../lessons/schema'

export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  correct: integer('correct', { mode: 'boolean' }).notNull(),
  answer: text('answer'), // JSON string of user's answer
  xpEarned: integer('xp_earned').notNull().default(0),
  attemptedAt: integer('attempted_at', { mode: 'timestamp' }).notNull(),
})
