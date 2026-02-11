import { desc, eq, sql } from 'drizzle-orm'
import type { Database } from '../../db'
import { userXp, userStreaks } from './schema'
import { user } from '../auth/auth.schema'

export type LeaderboardEntry = {
  rank: number
  userId: string
  name: string
  image: string | null
  totalXp: number
  level: number
  currentStreak: number
}

export async function getLeaderboard(db: Database, limit = 50): Promise<LeaderboardEntry[]> {
  const rows = await db
    .select({
      userId: userXp.userId,
      name: user.name,
      image: user.image,
      totalXp: userXp.totalXp,
      level: userXp.level,
    })
    .from(userXp)
    .innerJoin(user, eq(userXp.userId, user.id))
    .orderBy(desc(userXp.totalXp))
    .limit(limit)
    .all()

  // Fetch streaks for these users
  const userIds = rows.map((r) => r.userId)
  const streaks = userIds.length > 0
    ? await db.select().from(userStreaks).all()
    : []
  const streakMap = new Map(streaks.map((s) => [s.userId, s.currentStreak]))

  return rows.map((row, i) => ({
    rank: i + 1,
    userId: row.userId,
    name: row.name,
    image: row.image,
    totalXp: row.totalXp,
    level: row.level,
    currentStreak: streakMap.get(row.userId) ?? 0,
  }))
}

export async function getUserRank(db: Database, userId: string): Promise<number | null> {
  const row = await db
    .select({ count: sql<number>`count(*)` })
    .from(userXp)
    .where(
      sql`${userXp.totalXp} > (SELECT total_xp FROM user_xp WHERE user_id = ${userId})`
    )
    .get()

  if (!row) return null
  return row.count + 1
}
