import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { lessons } from '../lessons/schema'

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: [
      'multiple_choice',
      'code_completion',
      'matching',
      'sequencing',
      'fill_in_blank',
      'diagram_quiz',
      'guess_output',
      'spot_the_bug',
      'acronym_challenge',
    ],
  }).notNull(),
  content: text('content').notNull(), // JSON string, typed per exercise type
  difficulty: integer('difficulty').notNull().default(1), // 1-5
  xpReward: integer('xp_reward').notNull().default(10),
  sortOrder: integer('sort_order').notNull().default(0),
  status: text('status', { enum: ['draft', 'pending_review', 'published'] })
    .notNull()
    .default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
