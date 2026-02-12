import { useState, useEffect, useCallback } from 'react'
import { Brain, ClockCountdown, CheckCircle, XCircle, Info } from '@phosphor-icons/react'

type Content = {
  acronym: string
  fullForm: string
  options?: string[]
  timeLimitSeconds?: number
  explanation?: string
}

type Props = {
  content: Content
  onAnswer: (answer: string, correct: boolean) => void
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function AcronymChallenge({ content, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(content.timeLimitSeconds || 0)

  const hasOptions = content.options && content.options.length > 0
  const hasTimer = (content.timeLimitSeconds || 0) > 0
  const isCorrectOption = (opt: string) =>
    opt.toLowerCase() === content.fullForm.toLowerCase()

  const handleSubmit = useCallback(
    (answer: string) => {
      if (submitted) return
      setSubmitted(true)
      onAnswer(answer, answer.toLowerCase() === content.fullForm.toLowerCase())
    },
    [submitted, onAnswer, content.fullForm],
  )

  // Timer countdown
  useEffect(() => {
    if (!hasTimer || submitted) return
    if (timeLeft <= 0) {
      handleSubmit('')
      return
    }
    const t = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, hasTimer, submitted, handleSubmit])

  function handleOptionSelect(i: number) {
    if (submitted) return
    setSelected(i)
  }

  function handleCheckAnswer() {
    if (selected === null || !content.options) return
    handleSubmit(content.options[selected])
  }

  function handleTypedSubmit() {
    handleSubmit(typed.trim())
  }

  // --- Option card styles (two-phase: select then submit) ---
  function getOptionStyle(i: number) {
    const isSelected = selected === i
    const opt = content.options![i]
    const isCorrect = isCorrectOption(opt)

    if (!submitted) {
      return {
        border: isSelected
          ? '2px solid var(--color-primary)'
          : '1px solid var(--glass-border)',
        background: isSelected
          ? 'color-mix(in srgb, var(--color-primary) 8%, var(--glass-bg))'
          : 'var(--glass-bg)',
        opacity: 1,
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
      }
    }

    if (isCorrect) {
      return {
        border: '2px solid var(--color-success)',
        background:
          'color-mix(in srgb, var(--color-success) 10%, var(--glass-bg))',
        opacity: 1,
        transform: 'scale(1)',
      }
    }
    if (isSelected && !isCorrect) {
      return {
        border: '2px solid var(--color-danger)',
        background:
          'color-mix(in srgb, var(--color-danger) 10%, var(--glass-bg))',
        opacity: 1,
        transform: 'scale(1)',
      }
    }
    return {
      border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      opacity: 0.4,
      transform: 'scale(1)',
    }
  }

  function getChipStyle(i: number) {
    const isSelected = selected === i
    const opt = content.options![i]
    const isCorrect = isCorrectOption(opt)

    if (!submitted && isSelected) {
      return { background: 'var(--color-primary)', color: '#fff' }
    }
    if (submitted && isCorrect) {
      return { background: 'var(--color-success)', color: '#fff' }
    }
    if (submitted && isSelected && !isCorrect) {
      return { background: 'var(--color-danger)', color: '#fff' }
    }
    return {
      background: 'var(--surface-primary)',
      color: 'var(--text-secondary)',
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Brain
          size={24}
          weight="bold"
          style={{
            color: 'var(--color-primary)',
            marginTop: 2,
            flexShrink: 0,
          }}
        />
        <h3
          className="text-lg font-semibold leading-snug flex-1"
          style={{ color: 'var(--text-primary)' }}
        >
          What does{' '}
          <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
            {content.acronym}
          </span>{' '}
          stand for?
        </h3>

        {/* Timer */}
        {hasTimer && !submitted && (
          <div
            className="flex items-center gap-1.5 shrink-0"
            style={{
              color:
                timeLeft <= 5
                  ? 'var(--color-danger)'
                  : 'var(--text-secondary)',
              animation:
                timeLeft <= 5 && timeLeft > 0
                  ? 'acronym-pulse 1s ease-in-out infinite'
                  : 'none',
            }}
          >
            <ClockCountdown size={20} weight="bold" />
            <span className="text-lg font-bold tabular-nums">{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Pulse animation for timer (CSS-only) */}
      {hasTimer && (
        <style>{`
          @keyframes acronym-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.55; }
          }
        `}</style>
      )}

      {/* Option cards (two-phase: select then check) */}
      {hasOptions ? (
        <div className="flex flex-col gap-2.5">
          {content.options!.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleOptionSelect(i)}
              className="w-full text-left rounded-2xl px-4 py-3.5 active:scale-[0.98]"
              style={{
                ...getOptionStyle(i),
                backdropFilter: 'blur(var(--glass-blur))',
                cursor: submitted ? 'default' : 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              disabled={submitted}
            >
              <div className="flex items-center gap-3">
                {/* Letter chip */}
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    ...getChipStyle(i),
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {LETTERS[i]}
                </span>

                {/* Option text */}
                <span
                  className="text-[15px] leading-snug flex-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {opt}
                </span>

                {/* Result icons */}
                {submitted && isCorrectOption(opt) && (
                  <CheckCircle
                    size={22}
                    weight="fill"
                    style={{
                      color: 'var(--color-success)',
                      flexShrink: 0,
                    }}
                  />
                )}
                {submitted &&
                  selected === i &&
                  !isCorrectOption(opt) && (
                    <XCircle
                      size={22}
                      weight="fill"
                      style={{
                        color: 'var(--color-danger)',
                        flexShrink: 0,
                      }}
                    />
                  )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Text input fallback */
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && typed.trim() && !submitted)
              handleTypedSubmit()
          }}
          disabled={submitted}
          placeholder="Type the full form..."
          className="px-4 py-3.5 rounded-2xl text-[15px] outline-none"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            transition: 'border-color 0.2s ease',
          }}
        />
      )}

      {/* Check / Submit button (pre-submit only) */}
      {!submitted && hasOptions && (
        <button
          type="button"
          onClick={handleCheckAnswer}
          disabled={selected === null}
          className="w-full py-3.5 rounded-2xl text-[15px] font-semibold active:scale-[0.98]"
          style={{
            background:
              selected !== null
                ? 'var(--color-primary)'
                : 'var(--surface-primary)',
            color: selected !== null ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            cursor: selected !== null ? 'pointer' : 'not-allowed',
            opacity: selected !== null ? 1 : 0.6,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Check Answer
        </button>
      )}
      {!submitted && !hasOptions && (
        <button
          type="button"
          onClick={handleTypedSubmit}
          disabled={!typed.trim()}
          className="w-full py-3.5 rounded-2xl text-[15px] font-semibold active:scale-[0.98]"
          style={{
            background: typed.trim()
              ? 'var(--color-primary)'
              : 'var(--surface-primary)',
            color: typed.trim() ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            cursor: typed.trim() ? 'pointer' : 'not-allowed',
            opacity: typed.trim() ? 1 : 0.6,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Submit
        </button>
      )}

      {/* Correct answer reveal */}
      {submitted && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
          style={{
            background:
              'color-mix(in srgb, var(--color-success) 6%, var(--glass-bg))',
            border:
              '1px solid color-mix(in srgb, var(--color-success) 20%, transparent)',
          }}
        >
          <CheckCircle
            size={18}
            weight="fill"
            style={{
              color: 'var(--color-success)',
              marginTop: 1,
              flexShrink: 0,
            }}
          />
          <p
            className="text-[14px] font-medium leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {content.acronym} = {content.fullForm}
          </p>
        </div>
      )}

      {/* Explanation */}
      {submitted && content.explanation && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
          style={{
            background:
              'color-mix(in srgb, var(--color-primary) 6%, var(--glass-bg))',
            border:
              '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
          }}
        >
          <Info
            size={18}
            weight="fill"
            style={{
              color: 'var(--color-primary)',
              marginTop: 1,
              flexShrink: 0,
            }}
          />
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {content.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
