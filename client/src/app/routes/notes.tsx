import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { GlassCard, GlassButton } from '~/design-system'
import { useNotes, useCreateNote, useDeleteNote, useGenerateFromNote } from '~/domains/notes/api'

export const Route = createFileRoute('/notes')({
  component: NotesPage,
})

function NotesPage() {
  const { data: notes, isLoading } = useNotes()
  const createNote = useCreateNote()
  const deleteNote = useDeleteNote()
  const generateQuiz = useGenerateFromNote()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createNote.mutateAsync({ title, content })
    setTitle('')
    setContent('')
    setShowForm(false)
  }

  return (
    <div className="px-4 pt-12 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Notes</h1>
        <GlassButton onClick={() => setShowForm(!showForm)} variant="secondary">
          {showForm ? 'Cancel' : '+ New'}
        </GlassButton>
      </div>

      {showForm && (
        <GlassCard className="mb-4">
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              type="text" placeholder="Note title" value={title}
              onChange={(e) => setTitle(e.target.value)} required
              className="px-3 py-2 rounded-xl bg-[var(--surface-primary)] border border-[var(--glass-border)] text-[var(--text-primary)]"
            />
            <textarea
              placeholder="Write your learning notes..." value={content}
              onChange={(e) => setContent(e.target.value)} required rows={4}
              className="px-3 py-2 rounded-xl bg-[var(--surface-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] resize-none"
            />
            <GlassButton type="submit" disabled={createNote.isPending} fullWidth>
              {createNote.isPending ? 'Saving...' : 'Save Note'}
            </GlassButton>
          </form>
        </GlassCard>
      )}

      {isLoading && <p className="text-[var(--text-secondary)]">Loading...</p>}
      <div className="flex flex-col gap-3">
        {notes?.map((note) => (
          <GlassCard key={note.id}>
            <h3 className="font-semibold mb-1">{note.title}</h3>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-3">{note.content}</p>
            <div className="flex gap-2">
              <GlassButton
                variant="primary"
                onClick={() => generateQuiz.mutate(note.id)}
                disabled={generateQuiz.isPending}
                className="!text-xs !py-2 !px-3"
              >
                {generateQuiz.isPending ? 'Generating...' : 'Generate Quiz'}
              </GlassButton>
              <GlassButton
                variant="danger"
                onClick={() => deleteNote.mutate(note.id)}
                className="!text-xs !py-2 !px-3"
              >
                Delete
              </GlassButton>
            </div>
          </GlassCard>
        ))}
        {notes?.length === 0 && !showForm && (
          <p className="text-[var(--text-secondary)] text-center mt-8">
            No notes yet. Start writing!
          </p>
        )}
      </div>
    </div>
  )
}
