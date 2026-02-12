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

  function handleSelect(i: number) {
    if (submitted) return
    setSelected(i)
    setSubmitted(true)
    onAnswer(i, i === content.correctIndex)
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{content.question}</h3>
      <div className="flex flex-col gap-2">
        {content.options.map((opt, i) => {
          let borderColor = 'var(--glass-border)'
          if (submitted && i === content.correctIndex) borderColor = 'var(--color-success)'
          else if (submitted && i === selected) borderColor = 'var(--color-danger)'

          return (
            <GlassCard
              key={i}
              onClick={() => handleSelect(i)}
              className="!py-3"
              style={{ borderColor, opacity: submitted && i !== selected && i !== content.correctIndex ? 0.5 : 1 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: submitted && i === content.correctIndex ? 'var(--color-success)' :
                      submitted && i === selected ? 'var(--color-danger)' :
                      'var(--surface-primary)',
                    color: submitted && (i === content.correctIndex || i === selected) ? '#fff' : 'var(--text-secondary)',
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
    </div>
  )
}
