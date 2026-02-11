import { useState } from 'react'
import { GlassCard, GlassButton } from '~/design-system'

type Content = {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

type Props = {
  content: Content
  onAnswer: (answer: number, correct: boolean) => void
}

export function MultipleChoice({ content, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const correct = selected === content.correctIndex

  function handleSubmit() {
    if (selected === null) return
    setSubmitted(true)
    onAnswer(selected, correct)
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{content.question}</h3>
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
              className="!py-3"
              style={{ borderColor }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: i === selected ? 'var(--color-primary)' : 'var(--surface-primary)',
                    color: i === selected ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-[15px]">{opt}</span>
              </div>
            </GlassCard>
          )
        })}
      </div>
      {submitted && content.explanation && (
        <p className="text-[13px] text-[var(--text-secondary)] px-1">{content.explanation}</p>
      )}
      {!submitted && (
        <GlassButton onClick={handleSubmit} disabled={selected === null} fullWidth>
          Check Answer
        </GlassButton>
      )}
    </div>
  )
}
