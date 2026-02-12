import { useState } from 'react'
import { Code, TerminalWindow, CheckCircle, XCircle } from '@phosphor-icons/react'

type Content = {
  code: string
  language?: string
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

  const codeLines = content.code.split('\n')

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
      }
    }

    if (isCorrect) {
      return {
        border: '2px solid var(--color-success)',
        background: 'color-mix(in srgb, var(--color-success) 10%, var(--glass-bg))',
        opacity: 1,
      }
    }
    if (isSelected && !isCorrect) {
      return {
        border: '2px solid var(--color-danger)',
        background: 'color-mix(in srgb, var(--color-danger) 10%, var(--glass-bg))',
        opacity: 1,
      }
    }
    return {
      border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      opacity: 0.45,
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Code
          size={24}
          weight="bold"
          style={{ color: 'var(--color-primary)', flexShrink: 0 }}
        />
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          What does this output?
        </h3>
      </div>

      {/* Code block with line numbers */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Code header bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ background: '#252526', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
          </div>
          {content.language && (
            <span
              className="text-[11px] font-mono ml-auto"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {content.language}
            </span>
          )}
        </div>

        {/* Code lines */}
        <div
          className="overflow-x-auto"
          style={{ background: '#1E1E1E' }}
        >
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {codeLines.map((line, i) => (
                <tr key={i}>
                  <td
                    className="text-right select-none font-mono text-xs px-3 py-0.5"
                    style={{
                      color: 'rgba(255,255,255,0.2)',
                      width: '1%',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                      userSelect: 'none',
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="font-mono text-sm px-3 py-0.5"
                    style={{
                      color: '#D4D4D4',
                      whiteSpace: 'pre',
                    }}
                  >
                    {line || '\u00A0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Bottom padding */}
          <div className="h-3" />
        </div>
      </div>

      {/* Output options label */}
      <div className="flex items-center gap-2">
        <TerminalWindow
          size={18}
          weight="bold"
          style={{ color: 'var(--text-secondary)' }}
        />
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Output
        </span>
      </div>

      {/* Output options */}
      <div className="flex flex-col gap-2.5">
        {content.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelect(i)}
            className="w-full text-left rounded-2xl px-4 py-3 active:scale-[0.98]"
            style={{
              ...getOptionStyle(i),
              backdropFilter: 'blur(var(--glass-blur))',
              cursor: submitted ? 'default' : 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            disabled={submitted}
          >
            <div className="flex items-center gap-3">
              {/* Terminal prompt prefix */}
              <span
                className="font-mono text-sm font-bold shrink-0"
                style={{
                  color: submitted && i === content.correctIndex
                    ? 'var(--color-success)'
                    : submitted && i === selected && i !== content.correctIndex
                      ? 'var(--color-danger)'
                      : selected === i && !submitted
                        ? 'var(--color-primary)'
                        : 'var(--text-secondary)',
                  transition: 'color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                &gt;
              </span>

              {/* Option text */}
              <span
                className="font-mono text-sm flex-1"
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
