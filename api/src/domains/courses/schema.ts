import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull(),
  icon: text('icon'), // emoji or icon name
  color: text('color'), // hex color for card accent
  sortOrder: integer('sort_order').notNull().default(0),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
