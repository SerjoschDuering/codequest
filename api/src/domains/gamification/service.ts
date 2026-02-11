import { eq } from 'drizzle-orm'
import type { Database } from '../../db'
import { userXp, userStreaks } from './schema'

// XP thresholds per level
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6500]

export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateStr === yesterday.toISOString().split('T')[0]
}

export async function awardXp(db: Database, userId: string, xp: number) {
  const now = new Date()
  const existing = await db.select().from(userXp).where(eq(userXp.userId, userId)).get()

  if (existing) {
    const newTotal = existing.totalXp + xp
    const newLevel = calculateLevel(newTotal)
    await db.update(userXp)
      .set({ totalXp: newTotal, level: newLevel, updatedAt: now })
      .where(eq(userXp.userId, userId))
    return { totalXp: newTotal, level: newLevel, leveledUp: newLevel > existing.level }
  }

  const id = crypto.randomUUID()
  const level = calculateLevel(xp)
  await db.insert(userXp).values({ id, userId, totalXp: xp, level, updatedAt: now })
  return { totalXp: xp, level, leveledUp: level > 1 }
}

export async function updateStreak(db: Database, userId: string) {
  const today = todayDateStr()
  const now = new Date()
  const existing = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).get()

  if (!existing) {
    const id = crypto.randomUUID()
    await db.insert(userStreaks).values({
      id, userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today, updatedAt: now,
    })
    return { currentStreak: 1, longestStreak: 1 }
  }

  if (existing.lastActiveDate === today) {
    return { currentStreak: existing.currentStreak, longestStreak: existing.longestStreak }
  }

  let newStreak: number
  if (existing.lastActiveDate && isYesterday(existing.lastActiveDate)) {
    newStreak = existing.currentStreak + 1
  } else {
    newStreak = 1
  }
  const longest = Math.max(newStreak, existing.longestStreak)

  await db.update(userStreaks)
    .set({ currentStreak: newStreak, longestStreak: longest, lastActiveDate: today, updatedAt: now })
    .where(eq(userStreaks.userId, userId))

  return { currentStreak: newStreak, longestStreak: longest }
}

export async function getUserStats(db: Database, userId: string) {
  const xpRow = await db.select().from(userXp).where(eq(userXp.userId, userId)).get()
  const streakRow = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).get()

  return {
    totalXp: xpRow?.totalXp ?? 0,
    level: xpRow?.level ?? 1,
    currentStreak: streakRow?.currentStreak ?? 0,
    longestStreak: streakRow?.longestStreak ?? 0,
    lastActiveDate: streakRow?.lastActiveDate ?? null,
  }
}
