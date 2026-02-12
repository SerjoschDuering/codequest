import { useState } from 'react'

type Pair = { left: string; right: string }
type Content = { prompt: string; pairs: Pair[]; explanation?: string }

type Props = {
  content: Content
  onAnswer: (matches: number[], correct: boolean) => void
}

const PAIR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444', '#84CC16']

export function Matching({ content, onAnswer }: Props) {
  const [shuffledRight] = useState(() => {
    const indices = content.pairs.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  })
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Map<number, number>>(new Map())
  const [submitted, setSubmitted] = useState(false)
  const [matchOrder, setMatchOrder] = useState<number[]>([])

  const unmatchedLeft = content.pairs.map((_, i) => i).filter(i => !matches.has(i))
  const matchedShuffIdxs = new Set(matches.values())
  const unmatchedRight = shuffledRight
    .map((_, shuffIdx) => shuffIdx)
    .filter(si => !matchedShuffIdxs.has(si))

  function handleLeftTap(i: number) {
    if (submitted) return
    setSelectedLeft(selectedLeft === i ? null : i)
  }

  function handleRightTap(shuffIdx: number) {
    if (submitted || selectedLeft === null) return
    const next = new Map(matches)
    next.set(selectedLeft, shuffIdx)
    setMatches(next)
    const newOrder = [...matchOrder, selectedLeft]
    setMatchOrder(newOrder)
    setSelectedLeft(null)

    if (next.size === content.pairs.length) {
      const matchArr = content.pairs.map((_, i) => next.get(i) ?? -1)
      const correct = matchArr.every((rsi, li) => shuffledRight[rsi] === li)
      setSubmitted(true)
      setTimeout(() => onAnswer(matchArr, correct), 400)
    }
  }

  function undoMatch(leftIdx: number) {
    if (submitted) return
    const next = new Map(matches)
    next.delete(leftIdx)
    setMatches(next)
    setMatchOrder(matchOrder.filter(i => i !== leftIdx))
  }

  function colorFor(leftIdx: number) {
    return PAIR_COLORS[matchOrder.indexOf(leftIdx) % PAIR_COLORS.length]
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-lg font-semibold">{content.prompt}</h3>

      <p className="text-xs text-[var(--text-secondary)]">
        {selectedLeft !== null
          ? 'Now tap the matching definition below'
          : 'Tap a term, then tap its match'}
      </p>

      {/* Matched pairs */}
      {matchOrder.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Matched ({matchOrder.length}/{content.pairs.length})
          </span>
          {matchOrder.map(leftIdx => {
            const shuffIdx = matches.get(leftIdx)!
            const origIdx = shuffledRight[shuffIdx]
            const color = colorFor(leftIdx)
            const isCorrect = submitted ? origIdx === leftIdx : null
            return (
              <div
                key={`m-${leftIdx}`}
                onClick={() => undoMatch(leftIdx)}
                className="rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm cursor-pointer transition-all"
                style={{
                  background: `${color}15`,
                  border: `1.5px solid ${submitted
                    ? (isCorrect ? 'var(--color-success)' : 'var(--color-danger)')
                    : color}`,
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="font-medium">{content.pairs[leftIdx].left}</span>
                <span className="text-[var(--text-secondary)] mx-1">&rarr;</span>
                <span>{content.pairs[origIdx].right}</span>
                {!submitted && (
                  <span className="ml-auto text-[var(--text-secondary)] text-xs">&times;</span>
                )}
                {submitted && (
                  <span className="ml-auto text-sm">
                    {isCorrect ? '\u2713' : '\u2717'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Unmatched terms */}
      {unmatchedLeft.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Terms
          </span>
          <div className="flex flex-wrap gap-2">
            {unmatchedLeft.map(i => {
              const isActive = selectedLeft === i
              return (
                <button
                  key={`l-${i}`}
                  onClick={() => handleLeftTap(i)}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'var(--glass-bg)',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                    border: isActive
                      ? '1.5px solid var(--color-primary)'
                      : '1px solid var(--glass-border)',
                    backdropFilter: 'blur(var(--glass-blur))',
                    WebkitBackdropFilter: 'blur(var(--glass-blur))',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {content.pairs[i].left}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Unmatched definitions */}
      {unmatchedRight.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Definitions
          </span>
          {unmatchedRight.map(shuffIdx => {
            const origIdx = shuffledRight[shuffIdx]
            const isTarget = selectedLeft !== null
            return (
              <div
                key={`r-${shuffIdx}`}
                onClick={() => handleRightTap(shuffIdx)}
                className="rounded-xl px-3 py-2.5 text-sm transition-all"
                style={{
                  background: 'var(--glass-bg)',
                  border: isTarget
                    ? '1.5px solid rgba(59,130,246,0.3)'
                    : '1px solid var(--glass-border)',
                  backdropFilter: 'blur(var(--glass-blur))',
                  WebkitBackdropFilter: 'blur(var(--glass-blur))',
                  opacity: isTarget ? 1 : 0.7,
                  cursor: isTarget ? 'pointer' : 'default',
                }}
              >
                {content.pairs[origIdx].right}
              </div>
            )
          })}
        </div>
      )}

      {submitted && content.explanation && (
        <p className="text-[13px] text-[var(--text-secondary)]">{content.explanation}</p>
      )}
    </div>
  )
}
