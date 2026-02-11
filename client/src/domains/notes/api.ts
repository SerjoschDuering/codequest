import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Note = {
  id: string
  userId: string
  lessonId: string | null
  title: string
  content: string
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

export function useGenerateFromNote() {
  return useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch('/api/ai/notes-to-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ noteId }),
      })
      if (!res.ok) throw new Error('Failed to generate exercises')
      return res.json()
    },
  })
}
