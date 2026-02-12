import { useState } from 'react'

type Content = {
  code: string
  language: string
  bugLine: number
  bugDescription: string
  fixedCode: string
  hints?: string[]
}

type Props = {
  content: Content
  onAnswer: (answer: number, correct: boolean) => void
}

export function SpotTheBug({ content, onAnswer }: Props) {
  const lines = content.code.split('\n')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)

  function handleLineTap(lineNum: number) {
    if (submitted) return
    setSelectedLine(lineNum)
    setSubmitted(true)
    onAnswer(lineNum, lineNum === content.bugLine)
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Find the bug! Tap the buggy line.</h3>
      <div className="rounded-xl overflow-hidden" style={{ background: '#1E1E1E' }}>
        {lines.map((line, i) => {
          const lineNum = i + 1
          let bg = 'transparent'
          if (submitted && lineNum === content.bugLine) bg = 'rgba(255,59,48,0.2)'
          else if (submitted && lineNum === selectedLine && lineNum !== content.bugLine) bg = 'rgba(255,149,0,0.2)'

          return (
            <div
              key={i}
              className="flex cursor-pointer hover:bg-white/5 px-2"
              style={{ background: bg }}
              onClick={() => handleLineTap(lineNum)}
            >
              <span className="text-xs w-8 shrink-0 text-right pr-3 py-1 select-none" style={{ color: '#858585' }}>
                {lineNum}
              </span>
              <pre className="text-sm py-1 font-mono" style={{ color: '#D4D4D4' }}>
                {line || ' '}
              </pre>
            </div>
          )
        })}
      </div>
      {!submitted && content.hints && content.hints.length > 0 && (
        <button
          className="text-sm text-[var(--color-primary)] bg-transparent border-none cursor-pointer text-left"
          onClick={() => setShowHint(true)}
        >
          {showHint ? `Hint: ${content.hints[0]}` : 'Show hint'}
        </button>
      )}
      {submitted && (
        <div className="text-sm text-[var(--text-secondary)]">
          <p className="font-medium mb-1">{content.bugDescription}</p>
          <pre className="p-3 rounded-lg font-mono text-xs mt-2" style={{ background: '#1E1E1E', color: '#4EC9B0' }}>
            {content.fixedCode}
          </pre>
        </div>
      )}
    </div>
  )
}
