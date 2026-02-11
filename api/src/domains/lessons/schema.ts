import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { courses } from '../courses/schema'

export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  courseId: text('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  xpReward: integer('xp_reward').notNull().default(50),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
