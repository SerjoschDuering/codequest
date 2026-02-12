import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Trash, Sparkle, ArrowClockwise, Lightning, CircleNotch } from '@phosphor-icons/react'
import { GlassCard, GlassButton } from '~/design-system'
import {
  useNotes, useCreateNote, useDeleteNote,
  useGenerateNotesQuiz, useEnhanceNote,
  type Note,
} from '~/domains/notes/api'

export const Route = createFileRoute('/notes')({
  component: NotesPage,
})

function IconBtn({ icon, label, color, onClick, disabled, active }: {
  icon: React.ReactNode; label?: string; color?: string
  onClick: (e: React.MouseEvent) => void; disabled?: boolean; active?: boolean
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium active:scale-95 transition-all"
      style={{
        color: color || 'var(--text-secondary)',
        background: active ? `color-mix(in srgb, ${color} 12%, transparent)` : 'transparent',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  )
}

function NoteCard({
  note, isSelected, onToggle, onQuizMe, onDelete, onEnhance,
  isGenerating, isEnhancing,
}: {
  note: Note
  isSelected: boolean
  onToggle: () => void
  onQuizMe: () => void
  onDelete: () => void
  onEnhance: () => void
  isGenerating: boolean
  isEnhancing: boolean
}) {
  const [flipped, setFlipped] = useState(false)
  const navigate = useNavigate()
  const hasEnhanced = !!note.enhancedContent

  return (
    <GlassCard
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-[var(--color-primary)]' : ''}`}
      onClick={onToggle}
    >
      <div className="flex gap-3 items-start">
        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--glass-border)]'}`}>
          {isSelected && <span className="text-white text-xs">&#10003;</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1">{note.title}</h3>

          {/* Flip between original and enhanced */}
          {!flipped ? (
            <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-3">
              {note.content}
            </p>
          ) : (
            <div className="text-sm text-[var(--text-secondary)] mb-3 bg-[var(--surface-primary)] rounded-lg p-3 border border-[var(--glass-border)]">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-primary)] font-semibold block mb-1">
                AI Enhanced
              </span>
              <p className="whitespace-pre-wrap">{note.enhancedContent}</p>
            </div>
          )}

          {/* Icon toolbar */}
          <div className="flex items-center gap-1 mt-1">
            <IconBtn
              icon={isEnhancing ? <CircleNotch size={15} className="animate-spin" /> : <Sparkle size={15} weight={hasEnhanced ? 'fill' : 'bold'} />}
              label={isEnhancing ? 'Enhancing' : hasEnhanced ? (flipped ? 'Original' : 'Enhanced') : 'Enhance'}
              color="var(--color-primary)"
              onClick={(e) => { e.stopPropagation(); hasEnhanced ? setFlipped(!flipped) : onEnhance() }}
              disabled={isEnhancing}
              active={flipped}
            />
            {note.lessonId && (
              <IconBtn
                icon={<ArrowClockwise size={15} weight="bold" />}
                label="Replay"
                color="var(--color-teal)"
                onClick={(e) => { e.stopPropagation(); navigate({ to: '/lessons/$lessonId', params: { lessonId: note.lessonId! }, search: { from: 'notes' } }) }}
              />
            )}
            <IconBtn
              icon={isGenerating ? <CircleNotch size={15} className="animate-spin" /> : <Lightning size={15} weight="fill" />}
              label={isGenerating ? 'Creating' : note.lessonId ? 'Re-generate' : 'Generate'}
              color="var(--color-warning)"
              onClick={(e) => { e.stopPropagation(); onQuizMe() }}
              disabled={isGenerating}
            />
            <div className="flex-1" />
            <IconBtn
              icon={<Trash size={14} weight="bold" />}
              color="var(--color-danger)"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

function NotesPage() {
  const { data: notes, isLoading } = useNotes()
  const createNote = useCreateNote()
  const deleteNote = useDeleteNote()
  const generateQuiz = useGenerateNotesQuiz()
  const enhanceNote = useEnhanceNote()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [enhancingId, setEnhancingId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createNote.mutateAsync({ title, content })
    setTitle('')
    setContent('')
    setShowForm(false)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 5) next.add(id)
      return next
    })
  }

  async function handleGenerateQuiz(noteIds: string[]) {
    if (generateQuiz.isPending) return
    setError(null)
    setGeneratingId(noteIds.length === 1 ? noteIds[0] : 'multi')
    try {
      const result = await generateQuiz.mutateAsync(noteIds)
      setSelectedIds(new Set())
      navigate({ to: '/lessons/$lessonId', params: { lessonId: result.lessonId }, search: { from: 'notes' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quiz generation failed')
    } finally {
      setGeneratingId(null)
    }
  }

  async function handleEnhance(noteId: string) {
    if (enhanceNote.isPending) return
    setEnhancingId(noteId)
    try {
      await enhanceNote.mutateAsync(noteId)
    } catch {
      setError('Enhancement failed. Try again.')
    } finally {
      setEnhancingId(null)
    }
  }

  return (
    <div className="px-4 pt-12 max-w-lg mx-auto pb-32">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <GlassButton onClick={() => setSelectedIds(new Set())} variant="secondary">
              Cancel
            </GlassButton>
          )}
          <GlassButton onClick={() => setShowForm(!showForm)} variant="secondary">
            {showForm ? 'Cancel' : '+ New'}
          </GlassButton>
        </div>
      </div>

      {/* AI disclaimer */}
      <p className="text-[10px] text-[var(--text-tertiary)] mb-4 leading-relaxed">
        AI features powered by Llama 3.1 8B. Generated content may contain
        inaccuracies — always verify important concepts with official sources.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(255,59,48,0.1)] border-l-4 border-[var(--color-danger)] text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

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
          <NoteCard
            key={note.id}
            note={note}
            isSelected={selectedIds.has(note.id)}
            onToggle={() => toggleSelect(note.id)}
            onQuizMe={() => handleGenerateQuiz([note.id])}
            onDelete={() => deleteNote.mutate(note.id)}
            onEnhance={() => handleEnhance(note.id)}
            isGenerating={generatingId === note.id}
            isEnhancing={enhancingId === note.id}
          />
        ))}
        {notes?.length === 0 && !showForm && (
          <p className="text-[var(--text-secondary)] text-center mt-8">
            No notes yet. Start writing!
          </p>
        )}
      </div>

      {/* Sticky bottom bar for multi-note quiz */}
      {selectedIds.size > 1 && (
        <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-2 z-50">
          <div className="max-w-lg mx-auto">
            <GlassCard className="flex items-center justify-between !py-3">
              <span className="text-sm font-medium">{selectedIds.size} notes selected</span>
              <GlassButton
                variant="primary"
                onClick={() => handleGenerateQuiz([...selectedIds])}
                disabled={generateQuiz.isPending}
              >
                {generateQuiz.isPending ? 'Creating...' : 'Generate Quiz'}
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  )
}
