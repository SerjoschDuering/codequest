import { useState } from 'react'
import { Bug, Target, GitDiff, Lightbulb } from '@phosphor-icons/react'
import { GlassButton } from '~/design-system'

type Content = {
  code: string
  bugLine: number
  bugDescription: string
  fixedCode: string
  hints?: string[]
  explanation?: string
}

type Props = {
  content: Content
  onAnswer: (lineNum: number, correct: boolean) => void
}

export function SpotTheBug({ content, onAnswer }: Props) {
  const lines = content.code.split('\n')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)

  function handleLineTap(lineNum: number) {
    if (submitted) return
    setSelectedLine(lineNum)
  }

  function handleConfirm() {
    if (selectedLine === null || submitted) return
    setSubmitted(true)
    onAnswer(selectedLine, selectedLine === content.bugLine)
  }

  function handleShowHint() {
    if (!showHint) {
      setShowHint(true)
      return
    }
    if (content.hints && hintIndex < content.hints.length - 1) {
      setHintIndex(prev => prev + 1)
    }
  }

  function getLineAccent(lineNum: number) {
    if (submitted) {
      if (lineNum === content.bugLine) return 'var(--color-danger)'
      if (lineNum === selectedLine && lineNum !== content.bugLine) return 'var(--color-warning)'
      return 'transparent'
    }
    if (lineNum === selectedLine) return 'var(--color-primary)'
    return 'transparent'
  }

  function getLineBg(lineNum: number) {
    if (submitted) {
      if (lineNum === content.bugLine) return 'rgba(255,59,48,0.12)'
      if (lineNum === selectedLine && lineNum !== content.bugLine) return 'rgba(255,149,0,0.12)'
      return 'transparent'
    }
    if (lineNum === selectedLine) return 'rgba(var(--color-primary-rgb, 0,122,255), 0.08)'
    return 'transparent'
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,59,48,0.12)' }}
        >
          <Bug size={20} weight="bold" color="var(--color-danger)" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Find the bug!
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Tap the buggy line, then confirm.
          </p>
        </div>
      </div>

      {/* Code panel */}
      <div
        className="rounded-xl overflow-hidden border border-white/[0.06]"
        style={{ background: '#1E1E1E' }}
      >
        {lines.map((line, i) => {
          const lineNum = i + 1
          const accent = getLineAccent(lineNum)
          const bg = getLineBg(lineNum)
          const isClickable = !submitted

          return (
            <div
              key={i}
              className={`flex relative transition-colors duration-150 ${
                isClickable ? 'cursor-pointer hover:bg-white/[0.05]' : ''
              }`}
              style={{ background: bg }}
              onClick={() => handleLineTap(lineNum)}
            >
              {/* Accent bar */}
              <div
                className="w-[3px] shrink-0 transition-colors duration-200"
                style={{ background: accent }}
              />
              {/* Line number gutter */}
              <span
                className="text-xs w-10 shrink-0 text-right pr-4 py-1.5 select-none font-mono"
                style={{ color: '#858585' }}
              >
                {lineNum}
              </span>
              {/* Code content */}
              <pre
                className="text-[13px] py-1.5 font-mono pr-4 whitespace-pre overflow-x-auto"
                style={{ color: '#D4D4D4' }}
              >
                {line || ' '}
              </pre>
              {/* Bug marker on submitted bug line */}
              {submitted && lineNum === content.bugLine && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Target size={16} weight="bold" color="var(--color-danger)" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Confirm button (selection phase) */}
      {!submitted && selectedLine !== null && (
        <GlassButton
          onClick={handleConfirm}
          fullWidth
          className="active:scale-[0.98]"
        >
          Confirm Line {selectedLine}
        </GlassButton>
      )}

      {/* Hint button */}
      {!submitted && content.hints && content.hints.length > 0 && (
        <button
          className="flex items-center gap-2 text-sm text-[var(--color-primary)]
            bg-transparent border-none cursor-pointer text-left
            active:scale-[0.98] transition-transform duration-150 py-1"
          onClick={handleShowHint}
        >
          <Lightbulb size={18} weight="bold" />
          {showHint
            ? content.hints[hintIndex]
            : 'Show hint'}
        </button>
      )}

      {/* Result section */}
      {submitted && (
        <div className="flex flex-col gap-3 mt-1">
          {/* Bug description */}
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl"
            style={{
              background: 'rgba(255,59,48,0.08)',
              border: '1px solid rgba(255,59,48,0.15)',
            }}
          >
            <Bug size={18} weight="fill" color="var(--color-danger)" className="mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {content.bugDescription}
            </p>
          </div>

          {/* Explanation (if provided) */}
          {content.explanation && (
            <p className="text-[13px] text-[var(--text-secondary)] px-1 leading-relaxed">
              {content.explanation}
            </p>
          )}

          {/* Fixed code */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <GitDiff size={14} weight="bold" />
              <span className="font-medium">Corrected code</span>
            </div>
            <pre
              className="p-3 rounded-xl font-mono text-[13px] overflow-x-auto whitespace-pre
                border border-white/[0.06]"
              style={{ background: '#1a2e1a', color: '#4EC9B0' }}
            >
              {content.fixedCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
