import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { user } from '../auth/auth.schema'

export const userXp = sqliteTable('user_xp', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  totalXp: integer('total_xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const userStreaks = sqliteTable('user_streaks', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: text('last_active_date'), // YYYY-MM-DD format
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
