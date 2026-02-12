import { useState } from 'react'
import { ListChecks, CheckCircle, XCircle } from '@phosphor-icons/react'

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

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function MultipleChoice({ content, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSelect(i: number) {
    if (submitted) return
    setSelected(i)
  }

  function handleSubmit() {
    if (selected === null || submitted) return
    setSubmitted(true)
    onAnswer(selected, selected === content.correctIndex)
  }

  function getOptionStyle(i: number) {
    const isSelected = selected === i
    const isCorrect = i === content.correctIndex

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

    // Submitted state
    if (isCorrect) {
      return {
        border: '2px solid var(--color-success)',
        background: 'color-mix(in srgb, var(--color-success) 10%, var(--glass-bg))',
        opacity: 1,
        transform: 'scale(1)',
      }
    }
    if (isSelected && !isCorrect) {
      return {
        border: '2px solid var(--color-danger)',
        background: 'color-mix(in srgb, var(--color-danger) 10%, var(--glass-bg))',
        opacity: 1,
        transform: 'scale(1)',
      }
    }
    return {
      border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      opacity: 0.45,
      transform: 'scale(1)',
    }
  }

  function getChipStyle(i: number) {
    const isSelected = selected === i
    const isCorrect = i === content.correctIndex

    if (!submitted && isSelected) {
      return {
        background: 'var(--color-primary)',
        color: '#fff',
      }
    }
    if (submitted && isCorrect) {
      return {
        background: 'var(--color-success)',
        color: '#fff',
      }
    }
    if (submitted && isSelected && !isCorrect) {
      return {
        background: 'var(--color-danger)',
        color: '#fff',
      }
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
        <ListChecks
          size={24}
          weight="bold"
          style={{ color: 'var(--color-primary)', marginTop: 2, flexShrink: 0 }}
        />
        <h3
          className="text-lg font-semibold leading-snug"
          style={{ color: 'var(--text-primary)' }}
        >
          {content.question}
        </h3>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {content.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelect(i)}
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

              {/* Result icon */}
              {submitted && i === content.correctIndex && (
                <CheckCircle
                  size={22}
                  weight="fill"
                  style={{ color: 'var(--color-success)', flexShrink: 0 }}
                />
              )}
              {submitted && i === selected && i !== content.correctIndex && (
                <XCircle
                  size={22}
                  weight="fill"
                  style={{ color: 'var(--color-danger)', flexShrink: 0 }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Check Answer button */}
      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected === null}
          className="w-full py-3.5 rounded-2xl text-[15px] font-semibold active:scale-[0.98]"
          style={{
            background: selected !== null
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

    </div>
  )
}
