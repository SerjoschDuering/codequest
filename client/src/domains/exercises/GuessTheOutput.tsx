import { useState } from 'react'
import { GlassCard, GlassButton } from '~/design-system'

type Content = {
  code: string
  language: string
  options: string[]
  correctIndex: number
  explanation?: string
}

type Props = {
  content: Content
  onAnswer: (answer: number, correct: boolean) => void
}

export function GuessTheOutput({ content, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (selected === null) return
    setSubmitted(true)
    onAnswer(selected, selected === content.correctIndex)
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">What does this output?</h3>
      <pre
        className="p-4 rounded-xl text-sm font-mono overflow-x-auto"
        style={{ background: '#1E1E1E', color: '#D4D4D4' }}
      >
        <code>{content.code}</code>
      </pre>
      <div className="flex flex-col gap-2">
        {content.options.map((opt, i) => {
          let borderColor = 'var(--glass-border)'
          if (submitted && i === content.correctIndex) borderColor = 'var(--color-success)'
          else if (submitted && i === selected) borderColor = 'var(--color-danger)'
          else if (i === selected) borderColor = 'var(--color-primary)'

          return (
            <GlassCard
              key={i}
              onClick={submitted ? undefined : () => setSelected(i)}
              className="!py-2 font-mono text-sm"
              style={{ borderColor }}
            >
              {opt}
            </GlassCard>
          )
        })}
      </div>
      {submitted && content.explanation && (
        <p className="text-[13px] text-[var(--text-secondary)]">{content.explanation}</p>
      )}
      {!submitted && (
        <GlassButton onClick={handleSubmit} disabled={selected === null} fullWidth>
          Check Answer
        </GlassButton>
      )}
    </div>
  )
}
