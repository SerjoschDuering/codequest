import { useState, useRef, useEffect } from 'react'
import { PencilSimpleLine, CheckCircle, XCircle } from '@phosphor-icons/react'
import { GlassButton } from '~/design-system'

type Blank = {
  answer: string
  acceptAlternatives?: string[]
}

type Content = {
  sentence: string
  blanks: Blank[]
  explanation?: string
}

type Props = {
  content: Content
  onAnswer: (answers: string[], correct: boolean) => void
}

export function FillInBlank({ content, onAnswer }: Props) {
  const [answers, setAnswers] = useState<string[]>(content.blanks.map(() => ''))
  const [submitted, setSubmitted] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [hints, setHints] = useState<boolean[]>(content.blanks.map(() => false))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, content.blanks.length)
  }, [content.blanks.length])

  function isBlankCorrect(blankIndex: number): boolean {
    const blank = content.blanks[blankIndex]
    const userAnswer = answers[blankIndex].trim().toLowerCase()
    const accepted = [blank.answer, ...(blank.acceptAlternatives || [])].map(a => a.toLowerCase())
    return accepted.includes(userAnswer)
  }

  function handleSubmit() {
    if (submitted) return
    const allCorrect = content.blanks.every((_, i) => isBlankCorrect(i))
    setSubmitted(true)
    onAnswer(answers, allCorrect)
  }

  function handleInputChange(index: number, value: string) {
    const next = [...answers]
    next[index] = value
    setAnswers(next)
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (submitted) return
    if (e.key === 'Tab' && !e.shiftKey && index < content.blanks.length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
    if (e.key === 'Enter' && answers.every(a => a.trim())) {
      handleSubmit()
    }
  }

  const parts = content.sentence.split('_____')
  const allFilled = answers.every(a => a.trim())

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <PencilSimpleLine size={18} weight="bold" />
        <span className="text-xs font-medium uppercase tracking-wider">Fill in the blanks</span>
      </div>

      {/* Sentence with inline blanks */}
      <div
        className="text-[16px] leading-[2.4] px-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-flex flex-col items-start mx-1 align-bottom">
                <span className="relative inline-block">
                  <input
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    value={answers[i] || ''}
                    onChange={e => handleInputChange(i, e.target.value)}
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => setFocusedIndex(null)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    disabled={submitted}
                    autoComplete="off"
                    spellCheck={false}
                    className="inline-block min-w-[100px] px-2 py-1 font-mono text-[15px] text-center
                      bg-transparent border-0 border-b-2 border-dotted outline-none
                      transition-all duration-200"
                    style={{
                      borderBottomColor: submitted
                        ? (isBlankCorrect(i) ? 'var(--color-success)' : 'var(--color-danger)')
                        : focusedIndex === i
                          ? 'var(--color-primary)'
                          : 'var(--text-secondary)',
                      borderBottomStyle: submitted ? 'solid' : 'dotted',
                      color: submitted
                        ? (isBlankCorrect(i) ? 'var(--color-success)' : 'var(--color-danger)')
                        : 'var(--text-primary)',
                      boxShadow: focusedIndex === i && !submitted
                        ? '0 4px 12px rgba(var(--color-primary-rgb, 99, 102, 241), 0.15)'
                        : 'none',
                      width: `${Math.max(100, (answers[i]?.length || 0) * 10 + 40)}px`,
                    }}
                  />
                  {/* Status icon after submit */}
                  {submitted && (
                    <span className="absolute -right-6 top-1/2 -translate-y-1/2">
                      {isBlankCorrect(i)
                        ? <CheckCircle size={18} weight="fill" color="var(--color-success)" />
                        : <XCircle size={18} weight="fill" color="var(--color-danger)" />
                      }
                    </span>
                  )}
                </span>
                {/* Correct answer shown below wrong blanks */}
                {submitted && !isBlankCorrect(i) && (
                  <span
                    className="text-xs font-mono mt-0.5 transition-opacity duration-300"
                    style={{ color: 'var(--color-success)' }}
                  >
                    {content.blanks[i].answer}
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Hint + Submit buttons */}
      {!submitted && (
        <div className="flex gap-2 mt-1">
          <GlassButton
            variant="secondary"
            onClick={() => {
              const nextHints = [...hints]
              const unhinted = nextHints.findIndex((h) => !h)
              if (unhinted !== -1) {
                nextHints[unhinted] = true
                setHints(nextHints)
                const answer = content.blanks[unhinted].answer
                const hint = answer.slice(0, Math.ceil(answer.length / 2))
                handleInputChange(unhinted, hint)
                inputRefs.current[unhinted]?.focus()
              }
            }}
            disabled={hints.every(Boolean)}
            className="flex items-center justify-center gap-1.5"
          >
            Hint
          </GlassButton>
          <GlassButton
            onClick={handleSubmit}
            disabled={!allFilled}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} weight="bold" />
            Check Answer
          </GlassButton>
        </div>
      )}
    </div>
  )
}
