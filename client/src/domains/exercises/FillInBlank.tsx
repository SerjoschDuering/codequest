import { useState } from 'react'
import { GlassButton } from '~/design-system'

type Blank = { position: number; answer: string; acceptAlternatives?: string[] }
type Content = { sentence: string; blanks: Blank[] }

type Props = {
  content: Content
  onAnswer: (answers: string[], correct: boolean) => void
}

export function FillInBlank({ content, onAnswer }: Props) {
  const [answers, setAnswers] = useState<string[]>(content.blanks.map(() => ''))
  const [submitted, setSubmitted] = useState(false)

  function checkCorrect(): boolean {
    return content.blanks.every((blank, i) => {
      const userAnswer = answers[i].trim().toLowerCase()
      const accepted = [blank.answer, ...(blank.acceptAlternatives || [])].map(a => a.toLowerCase())
      return accepted.includes(userAnswer)
    })
  }

  function handleSubmit() {
    const correct = checkCorrect()
    setSubmitted(true)
    onAnswer(answers, correct)
  }

  // Split sentence by blank positions and render inputs inline
  const parts = content.sentence.split('_____')

  return (
    <div className="flex flex-col gap-4">
      <div className="text-lg leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                type="text"
                value={answers[i] || ''}
                onChange={(e) => {
                  const next = [...answers]
                  next[i] = e.target.value
                  setAnswers(next)
                }}
                disabled={submitted}
                className="inline-block w-32 mx-1 px-2 py-1 rounded-lg text-center font-mono border"
                style={{
                  borderColor: submitted
                    ? (answers[i]?.trim().toLowerCase() === content.blanks[i]?.answer.toLowerCase()
                      ? 'var(--color-success)' : 'var(--color-danger)')
                    : 'var(--glass-border)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            )}
          </span>
        ))}
      </div>
      {submitted && (
        <p className="text-sm text-[var(--text-secondary)]">
          Answers: {content.blanks.map(b => b.answer).join(', ')}
        </p>
      )}
      {!submitted && (
        <GlassButton onClick={handleSubmit} disabled={answers.some(a => !a.trim())} fullWidth>
          Check Answer
        </GlassButton>
      )}
    </div>
  )
}
