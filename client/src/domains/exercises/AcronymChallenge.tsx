import { useState, useEffect } from 'react'
import { GlassCard, GlassButton } from '~/design-system'

type Content = {
  acronym: string
  fullForm: string
  options?: string[]
  timeLimitSeconds?: number
}

type Props = {
  content: Content
  onAnswer: (answer: string, correct: boolean) => void
}

export function AcronymChallenge({ content, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(content.timeLimitSeconds || 0)

  const hasOptions = content.options && content.options.length > 0
  const hasTimer = (content.timeLimitSeconds || 0) > 0

  useEffect(() => {
    if (!hasTimer || submitted) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      onAnswer('', false)
      return
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, hasTimer, submitted, onAnswer])

  function handleSubmit() {
    const answer = hasOptions ? selected || '' : typed.trim()
    const correct = answer.toLowerCase() === content.fullForm.toLowerCase()
    setSubmitted(true)
    onAnswer(answer, correct)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          What does <span style={{ color: 'var(--color-primary)' }}>{content.acronym}</span> stand for?
        </h3>
        {hasTimer && !submitted && (
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: timeLeft <= 5 ? 'var(--color-danger)' : 'var(--text-secondary)' }}
          >
            {timeLeft}s
          </span>
        )}
      </div>

      {hasOptions ? (
        <div className="flex flex-col gap-2">
          {content.options!.map((opt) => (
            <GlassCard
              key={opt}
              onClick={submitted ? undefined : () => setSelected(opt)}
              className="!py-3 text-[15px]"
              style={{
                borderColor:
                  submitted && opt === content.fullForm ? 'var(--color-success)' :
                  submitted && opt === selected ? 'var(--color-danger)' :
                  opt === selected ? 'var(--color-primary)' : 'var(--glass-border)',
              }}
            >
              {opt}
            </GlassCard>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={submitted}
          placeholder="Type the full form..."
          className="px-4 py-3 rounded-xl bg-[var(--surface-primary)] border border-[var(--glass-border)] text-[var(--text-primary)]"
        />
      )}

      {submitted && (
        <p className="text-sm" style={{ color: 'var(--color-success)' }}>
          {content.fullForm}
        </p>
      )}
      {!submitted && (
        <GlassButton
          onClick={handleSubmit}
          disabled={hasOptions ? !selected : !typed.trim()}
          fullWidth
        >
          Submit
        </GlassButton>
      )}
    </div>
  )
}
