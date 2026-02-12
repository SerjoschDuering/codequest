import { useState, useRef, useEffect } from 'react'
import { BracketsCurly, CheckCircle } from '@phosphor-icons/react'
import { GlassButton } from '~/design-system'

type Blank = {
  answer: string
  placeholder?: string
}

type Content = {
  prompt: string
  codeTemplate: string
  blanks: Blank[]
  explanation?: string
}

type Props = {
  content: Content
  onAnswer: (answers: string[], correct: boolean) => void
}

export function CodeCompletion({ content, onAnswer }: Props) {
  const [answers, setAnswers] = useState<string[]>(content.blanks.map(() => ''))
  const [submitted, setSubmitted] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [hints, setHints] = useState<boolean[]>(content.blanks.map(() => false))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, content.blanks.length)
  }, [content.blanks.length])

  function isBlankCorrect(index: number): boolean {
    const blank = content.blanks[index]
    if (!blank) return false
    return answers[index].trim().toLowerCase() === blank.answer.toLowerCase()
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

  const parts = content.codeTemplate.split(/___BLANK___/)
  const allFilled = answers.every(a => a.trim())

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-primary)', opacity: 0.9 }}
        >
          <BracketsCurly size={18} weight="bold" color="#fff" />
        </div>
        <h3
          className="text-[15px] font-semibold leading-snug"
          style={{ color: 'var(--text-primary)' }}
        >
          {content.prompt}
        </h3>
      </div>

      {/* Code block */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1E1E1E' }}>
        <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed m-0">
          {parts.map((part, i) => (
            <span key={i}>
              <span style={{ color: '#D4D4D4' }}>{part}</span>
              {i < parts.length - 1 && (
                <span className="inline-block align-middle my-0.5">
                  <input
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    value={answers[i]}
                    onChange={e => handleInputChange(i, e.target.value)}
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => setFocusedIndex(null)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    disabled={submitted}
                    placeholder={content.blanks[i]?.placeholder || '...'}
                    autoComplete="off"
                    spellCheck={false}
                    className="inline-block px-2.5 py-1 rounded font-mono text-sm
                      border-2 border-dotted outline-none
                      transition-all duration-200"
                    style={{
                      background: '#2D2D2D',
                      width: `${Math.max(80, (answers[i]?.length || content.blanks[i]?.placeholder?.length || 3) * 9.5 + 30)}px`,
                      color: submitted
                        ? (isBlankCorrect(i) ? '#4EC9B0' : '#F44747')
                        : '#CE9178',
                      borderColor: submitted
                        ? (isBlankCorrect(i) ? '#4EC9B0' : '#F44747')
                        : focusedIndex === i
                          ? '#569CD6'
                          : '#3E3E3E',
                      borderStyle: submitted ? 'solid' : 'dotted',
                      boxShadow: focusedIndex === i && !submitted
                        ? '0 0 0 2px rgba(86, 156, 214, 0.25)'
                        : 'none',
                    }}
                  />
                  {/* Inline status icon */}
                  {submitted && (
                    <span className="inline-block align-middle ml-1">
                      {isBlankCorrect(i)
                        ? <CheckCircle size={16} weight="fill" color="#4EC9B0" />
                        : <span style={{ color: '#F44747', fontSize: '12px' }}>x</span>
                      }
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </pre>
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
            Check Code
          </GlassButton>
        </div>
      )}
    </div>
  )
}
