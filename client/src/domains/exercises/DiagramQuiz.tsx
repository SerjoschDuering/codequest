import { useState, useEffect, useRef } from 'react'
import { Graph, CheckCircle, XCircle } from '@phosphor-icons/react'
import { GlassCard, GlassButton } from '~/design-system'

type Question = {
  question: string
  answer: string
  options?: string[]
}

type Content = {
  diagram: string
  questions: Array<Question>
  explanation?: string
}

type Props = {
  content: Content
  onAnswer: (answers: string[], correct: boolean) => void
}

export function DiagramQuiz({ content, onAnswer }: Props) {
  const [answers, setAnswers] = useState<string[]>(
    content.questions.map(() => '')
  )
  const [submitted, setSubmitted] = useState(false)
  const submittedRef = useRef(false)

  const allOptionBased = content.questions.every(
    q => q.options && q.options.length > 0
  )
  const allFilled = answers.every(a => a.trim())

  // Auto-submit when all option-based questions are answered
  useEffect(() => {
    if (submittedRef.current || !allOptionBased || !allFilled) return
    submittedRef.current = true
    const correct = checkCorrectness()
    setSubmitted(true)
    setTimeout(() => onAnswer(answers, correct), 400)
  }, [answers, allOptionBased, allFilled])

  function checkCorrectness() {
    return content.questions.every(
      (q, i) => answers[i].trim().toLowerCase() === q.answer.toLowerCase()
    )
  }

  function isQuestionCorrect(qi: number) {
    return (
      answers[qi].trim().toLowerCase() ===
      content.questions[qi].answer.toLowerCase()
    )
  }

  function handleManualSubmit() {
    if (submittedRef.current) return
    const correct = checkCorrectness()
    setSubmitted(true)
    submittedRef.current = true
    onAnswer(answers, correct)
  }

  function setAnswer(qi: number, value: string) {
    const next = [...answers]
    next[qi] = value
    setAnswers(next)
  }

  function getOptionBorder(qi: number, opt: string) {
    const q = content.questions[qi]
    const isCorrectAnswer = opt.toLowerCase() === q.answer.toLowerCase()
    const isSelected = opt === answers[qi]

    if (submitted && isCorrectAnswer) return 'var(--color-success)'
    if (submitted && isSelected && !isCorrectAnswer) return 'var(--color-danger)'
    if (!submitted && isSelected) return 'var(--color-primary)'
    return 'var(--glass-border)'
  }

  function getOptionBg(qi: number, opt: string) {
    const q = content.questions[qi]
    const isCorrectAnswer = opt.toLowerCase() === q.answer.toLowerCase()
    const isSelected = opt === answers[qi]

    if (submitted && isCorrectAnswer) return 'rgba(52,199,89,0.08)'
    if (submitted && isSelected && !isCorrectAnswer) return 'rgba(255,59,48,0.08)'
    return undefined
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--glass-bg)' }}
        >
          <Graph size={20} weight="bold" color="var(--color-primary)" />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          Diagram Quiz
        </h3>
      </div>

      {/* ASCII diagram */}
      <div
        className="rounded-xl overflow-x-auto border border-white/[0.06]"
        style={{ background: '#1E1E1E' }}
      >
        <pre
          className="p-4 text-xs font-mono whitespace-pre leading-relaxed"
          style={{ color: '#D4D4D4' }}
        >
          {content.diagram}
        </pre>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-5">
        {content.questions.map((q, qi) => (
          <div key={qi} className="flex flex-col gap-2.5">
            {/* Question label with correctness indicator */}
            <div className="flex items-start gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center
                  text-xs font-bold shrink-0 mt-0.5"
                style={{
                  background: submitted
                    ? isQuestionCorrect(qi)
                      ? 'rgba(52,199,89,0.15)'
                      : 'rgba(255,59,48,0.15)'
                    : 'var(--surface-primary)',
                  color: submitted
                    ? isQuestionCorrect(qi)
                      ? 'var(--color-success)'
                      : 'var(--color-danger)'
                    : 'var(--text-secondary)',
                }}
              >
                {submitted ? (
                  isQuestionCorrect(qi) ? (
                    <CheckCircle size={16} weight="fill" />
                  ) : (
                    <XCircle size={16} weight="fill" />
                  )
                ) : (
                  qi + 1
                )}
              </span>
              <p className="font-medium text-[15px] text-[var(--text-primary)] leading-snug">
                {q.question}
              </p>
            </div>

            {/* Options or text input */}
            {q.options ? (
              <div className="flex flex-col gap-1.5 pl-8">
                {q.options.map(opt => {
                  const borderColor = getOptionBorder(qi, opt)
                  const bg = getOptionBg(qi, opt)
                  const isSelected = opt === answers[qi]
                  const dimmed =
                    submitted &&
                    opt.toLowerCase() !== q.answer.toLowerCase() &&
                    !isSelected

                  return (
                    <GlassCard
                      key={opt}
                      onClick={
                        submitted
                          ? undefined
                          : () => setAnswer(qi, opt)
                      }
                      className="!py-2.5 !px-3 text-sm active:scale-[0.98]"
                      style={{
                        borderColor,
                        background: bg,
                        opacity: dimmed ? 0.5 : 1,
                        transition:
                          'border-color 0.2s, background 0.2s, opacity 0.2s, transform 0.15s',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {submitted &&
                          opt.toLowerCase() === q.answer.toLowerCase() && (
                            <CheckCircle
                              size={18}
                              weight="fill"
                              color="var(--color-success)"
                            />
                          )}
                        {submitted &&
                          isSelected &&
                          opt.toLowerCase() !== q.answer.toLowerCase() && (
                            <XCircle
                              size={18}
                              weight="fill"
                              color="var(--color-danger)"
                            />
                          )}
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            ) : (
              <div className="pl-8">
                <input
                  type="text"
                  value={answers[qi]}
                  onChange={e => setAnswer(qi, e.target.value)}
                  disabled={submitted}
                  placeholder="Type your answer..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm
                    text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50
                    outline-none transition-colors duration-200"
                  style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(var(--glass-blur))',
                    border: `1px solid ${
                      submitted
                        ? isQuestionCorrect(qi)
                          ? 'var(--color-success)'
                          : 'var(--color-danger)'
                        : 'var(--glass-border)'
                    }`,
                  }}
                />
                {submitted && !isQuestionCorrect(qi) && (
                  <p className="text-xs text-[var(--color-success)] mt-1.5 pl-1">
                    Correct answer: {content.questions[qi].answer}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit button for non-option questions */}
      {!submitted && !allOptionBased && (
        <GlassButton
          onClick={handleManualSubmit}
          disabled={!allFilled}
          fullWidth
          className="active:scale-[0.98]"
        >
          Check Answers
        </GlassButton>
      )}

      {/* Explanation */}
      {submitted && content.explanation && (
        <p className="text-[13px] text-[var(--text-secondary)] px-1 leading-relaxed">
          {content.explanation}
        </p>
      )}
    </div>
  )
}
