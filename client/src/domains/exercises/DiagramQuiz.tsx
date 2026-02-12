import { useState, useEffect, useRef } from 'react'
import { GlassCard, GlassButton } from '~/design-system'

type Question = { question: string; options?: string[]; answer: string }
type Content = { diagram: string; diagramType: string; questions: Question[] }

type Props = {
  content: Content
  onAnswer: (answers: string[], correct: boolean) => void
}

export function DiagramQuiz({ content, onAnswer }: Props) {
  const [answers, setAnswers] = useState<string[]>(content.questions.map(() => ''))
  const [submitted, setSubmitted] = useState(false)
  const submittedRef = useRef(false)

  const allOptionBased = content.questions.every(q => q.options && q.options.length > 0)
  const allFilled = answers.every(a => a.trim())

  // Auto-submit when all option-based questions answered
  useEffect(() => {
    if (submittedRef.current || !allOptionBased || !allFilled) return
    submittedRef.current = true
    const correct = content.questions.every((q, i) =>
      answers[i].trim().toLowerCase() === q.answer.toLowerCase()
    )
    setSubmitted(true)
    setTimeout(() => onAnswer(answers, correct), 400)
  }, [answers, allOptionBased, allFilled, content.questions, onAnswer])

  function handleManualSubmit() {
    const correct = content.questions.every((q, i) =>
      answers[i].trim().toLowerCase() === q.answer.toLowerCase()
    )
    setSubmitted(true)
    submittedRef.current = true
    onAnswer(answers, correct)
  }

  return (
    <div className="flex flex-col gap-4">
      <pre
        className="p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre"
        style={{ background: '#1E1E1E', color: '#D4D4D4' }}
      >
        {content.diagram}
      </pre>
      {content.questions.map((q, qi) => (
        <div key={qi} className="flex flex-col gap-2">
          <p className="font-medium text-[15px]">{q.question}</p>
          {q.options ? (
            <div className="flex flex-col gap-1.5">
              {q.options.map((opt) => {
                let borderColor = 'var(--glass-border)'
                if (submitted && opt.toLowerCase() === q.answer.toLowerCase()) borderColor = 'var(--color-success)'
                else if (submitted && opt === answers[qi]) borderColor = 'var(--color-danger)'
                else if (opt === answers[qi]) borderColor = 'var(--color-primary)'
                return (
                  <GlassCard
                    key={opt}
                    onClick={submitted ? undefined : () => {
                      const next = [...answers]; next[qi] = opt; setAnswers(next)
                    }}
                    className="!py-2 text-sm"
                    style={{ borderColor }}
                  >
                    {opt}
                  </GlassCard>
                )
              })}
            </div>
          ) : (
            <input
              type="text" value={answers[qi]}
              onChange={(e) => { const n = [...answers]; n[qi] = e.target.value; setAnswers(n) }}
              disabled={submitted}
              className="px-3 py-2 rounded-xl bg-[var(--surface-primary)] border border-[var(--glass-border)] text-[var(--text-primary)]"
            />
          )}
        </div>
      ))}
      {!submitted && !allOptionBased && (
        <GlassButton onClick={handleManualSubmit} disabled={!allFilled} fullWidth>
          Check Answers
        </GlassButton>
      )}
    </div>
  )
}
