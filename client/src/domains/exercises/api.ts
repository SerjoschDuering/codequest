import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Exercise = {
  id: string
  lessonId: string
  type: string
  content: string // JSON string
  difficulty: number
  xpReward: number
  sortOrder: number
  status: string
}

export type SubmitResult = {
  correct: boolean
  xpEarned: number
  totalXp: number
  level: number
  leveledUp: boolean
  currentStreak: number
  longestStreak: number
}

async function fetchExercises(lessonId: string): Promise<Exercise[]> {
  const res = await fetch(`/api/exercises?lessonId=${lessonId}`, { credentials: 'include' })
  const data = await res.json()
  return (data as { exercises: Exercise[] }).exercises
}

async function submitAnswer(params: {
  exerciseId: string
  lessonId: string
  answer: unknown
  correct: boolean
}): Promise<SubmitResult> {
  const res = await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Failed to submit')
  return res.json() as Promise<SubmitResult>
}

export function useExercises(lessonId: string) {
  return useQuery({
    queryKey: ['exercises', lessonId],
    queryFn: () => fetchExercises(lessonId),
    enabled: !!lessonId,
  })
}

export function useSubmitAnswer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: submitAnswer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-stats'] })
      qc.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}
