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

  function handleSelect(i: number) {
    if (submitted) return
    setSelected(i)
    setSubmitted(true)
    onAnswer(i, i === content.correctIndex)
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

          return (
            <GlassCard
              key={i}
              onClick={() => handleSelect(i)}
              className="!py-2 font-mono text-sm"
              style={{ borderColor, opacity: submitted && i !== selected && i !== content.correctIndex ? 0.5 : 1 }}
            >
              {opt}
            </GlassCard>
          )
        })}
      </div>
      {submitted && content.explanation && (
        <p className="text-[13px] text-[var(--text-secondary)]">{content.explanation}</p>
      )}
    </div>
  )
}
