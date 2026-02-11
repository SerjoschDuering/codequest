import { useQuery } from '@tanstack/react-query'

export type LeaderboardEntry = {
  rank: number
  userId: string
  name: string
  image: string | null
  totalXp: number
  level: number
  currentStreak: number
}

type LeaderboardResponse = {
  entries: LeaderboardEntry[]
  myRank: number | null
  userId: string
}

async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await fetch('/api/gamification/leaderboard', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch leaderboard')
  return res.json() as Promise<LeaderboardResponse>
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 1000 * 30, // refresh every 30s
  })
}
