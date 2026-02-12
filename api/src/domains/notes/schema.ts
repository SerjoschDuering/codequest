import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { user } from '../auth/auth.schema'
import { lessons } from '../lessons/schema'

export const userNotes = sqliteTable('user_notes', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(), // markdown text
  enhancedContent: text('enhanced_content'), // AI-expanded explanation
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
