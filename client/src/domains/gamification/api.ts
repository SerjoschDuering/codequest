import { useQuery } from '@tanstack/react-query'

export type UserStats = {
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
}

async function fetchStats(): Promise<UserStats> {
  const res = await fetch('/api/gamification/me', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json() as Promise<UserStats>
}

export function useUserStats() {
  return useQuery({ queryKey: ['user-stats'], queryFn: fetchStats })
}
