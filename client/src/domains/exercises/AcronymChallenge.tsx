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

  function handleOptionTap(opt: string) {
    if (submitted) return
    setSubmitted(true)
    onAnswer(opt, opt.toLowerCase() === content.fullForm.toLowerCase())
  }

  function handleTypedSubmit() {
    const answer = typed.trim()
    setSubmitted(true)
    onAnswer(answer, answer.toLowerCase() === content.fullForm.toLowerCase())
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
          {content.options!.map((opt) => {
            let borderColor = 'var(--glass-border)'
            if (submitted && opt.toLowerCase() === content.fullForm.toLowerCase()) borderColor = 'var(--color-success)'
            else if (submitted) borderColor = 'var(--glass-border)'
            return (
              <GlassCard
                key={opt}
                onClick={() => handleOptionTap(opt)}
                className="!py-3 text-[15px]"
                style={{
                  borderColor,
                  opacity: submitted && opt.toLowerCase() !== content.fullForm.toLowerCase() ? 0.5 : 1,
                }}
              >
                {opt}
              </GlassCard>
            )
          })}
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
      {!submitted && !hasOptions && (
        <GlassButton onClick={handleTypedSubmit} disabled={!typed.trim()} fullWidth>
          Submit
        </GlassButton>
      )}
    </div>
  )
}
