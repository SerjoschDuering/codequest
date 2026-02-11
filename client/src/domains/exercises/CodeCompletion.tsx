import { useState } from 'react'
import { GlassButton } from '~/design-system'

type Blank = { placeholder: string; answer: string; hints?: string[] }
type Content = { prompt: string; codeTemplate: string; blanks: Blank[]; language?: string }

type Props = {
  content: Content
  onAnswer: (answers: string[], correct: boolean) => void
}

export function CodeCompletion({ content, onAnswer }: Props) {
  const [answers, setAnswers] = useState<string[]>(content.blanks.map(() => ''))
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    const correct = content.blanks.every((blank, i) =>
      answers[i].trim().toLowerCase() === blank.answer.toLowerCase()
    )
    setSubmitted(true)
    onAnswer(answers, correct)
  }

  // Replace ___BLANK___ placeholders with inline inputs
  const parts = content.codeTemplate.split(/___BLANK___/)

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{content.prompt}</h3>
      <pre
        className="p-4 rounded-xl text-sm font-mono overflow-x-auto whitespace-pre-wrap"
        style={{ background: '#1E1E1E', color: '#D4D4D4' }}
      >
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                type="text"
                value={answers[i]}
                onChange={(e) => {
                  const next = [...answers]
                  next[i] = e.target.value
                  setAnswers(next)
                }}
                disabled={submitted}
                placeholder={content.blanks[i]?.placeholder || '...'}
                className="inline-block w-28 mx-0.5 px-2 py-0.5 rounded font-mono text-sm border"
                style={{
                  background: '#2D2D2D',
                  color: submitted
                    ? (answers[i]?.trim().toLowerCase() === content.blanks[i]?.answer.toLowerCase()
                      ? '#4EC9B0' : '#F44747')
                    : '#CE9178',
                  borderColor: '#3E3E3E',
                }}
              />
            )}
          </span>
        ))}
      </pre>
      {submitted && (
        <p className="text-sm text-[var(--text-secondary)]">
          Answers: {content.blanks.map(b => b.answer).join(', ')}
        </p>
      )}
      {!submitted && (
        <GlassButton onClick={handleSubmit} disabled={answers.some(a => !a.trim())} fullWidth>
          Check Code
        </GlassButton>
      )}
    </div>
  )
}
