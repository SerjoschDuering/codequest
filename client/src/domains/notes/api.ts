import { useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Note = {
  id: string
  userId: string
  lessonId: string | null
  title: string
  content: string
  enhancedContent: string | null
  createdAt: string
  updatedAt: string
}

async function fetchNotes(): Promise<Note[]> {
  const res = await fetch('/api/notes', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch notes')
  const data = await res.json()
  return (data as { notes: Note[] }).notes
}

export function useNotes() {
  return useQuery({ queryKey: ['notes'], queryFn: fetchNotes })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { title: string; content: string; lessonId?: string }) => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error('Failed to create note')
      return res.json() as Promise<{ id: string }>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notes/${id}`, { method: 'DELETE', credentials: 'include' })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })
}

export function useEnhanceNote() {
  const qc = useQueryClient()
  const abortRef = useRef<AbortController | null>(null)
  const mutation = useMutation({
    mutationFn: async (noteId: string) => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      const res = await fetch('/api/ai/enhance-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ noteId }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error('Enhancement failed')
      return res.json() as Promise<{ enhancedContent: string }>
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })
  return { ...mutation, cancel: () => abortRef.current?.abort() }
}

export function useGenerateNotesQuiz() {
  const qc = useQueryClient()
  const abortRef = useRef<AbortController | null>(null)
  const mutation = useMutation({
    mutationFn: async (noteIds: string[]) => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      const res = await fetch('/api/ai/notes-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ noteIds }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || 'Failed to generate quiz')
      }
      return res.json() as Promise<{ lessonId: string; courseId: string; exerciseCount: number }>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
  })
  return { ...mutation, cancel: () => abortRef.current?.abort() }
}
