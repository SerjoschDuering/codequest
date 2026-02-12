import { useState } from 'react'
import { GlassCard } from '~/design-system'

type Pair = { left: string; right: string }
type Content = { prompt: string; pairs: Pair[] }

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

  function handleLeftClick(i: number) {
    if (submitted) return
    setSelectedLeft(selectedLeft === i ? null : i)
  }

  function handleRightClick(shuffIdx: number) {
    if (submitted || selectedLeft === null) return
    const next = new Map(matches)
    next.set(selectedLeft, shuffIdx)
    setMatches(next)
    if (!matchOrder.includes(selectedLeft)) setMatchOrder([...matchOrder, selectedLeft])
    setSelectedLeft(null)

    // Auto-submit when all pairs matched
    if (next.size === content.pairs.length) {
      const matchArr = content.pairs.map((_, i) => next.get(i) ?? -1)
      const correct = matchArr.every((rsi, li) => shuffledRight[rsi] === li)
      setSubmitted(true)
      setTimeout(() => onAnswer(matchArr, correct), 400)
    }
  }

  function pairColor(leftIdx: number): string | null {
    if (!matches.has(leftIdx)) return null
    return PAIR_COLORS[matchOrder.indexOf(leftIdx) % PAIR_COLORS.length]
  }

  function pairNum(leftIdx: number): number | null {
    if (!matches.has(leftIdx)) return null
    return matchOrder.indexOf(leftIdx) + 1
  }

  function Badge({ color, num }: { color: string; num: number }) {
    return (
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: color }}
      >
        {num}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{content.prompt}</h3>
      <p className="text-xs text-[var(--text-tertiary)]">Tap left, then its match on the right</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {content.pairs.map((pair, i) => {
            const color = pairColor(i)
            const num = pairNum(i)
            return (
              <GlassCard
                key={i}
                onClick={() => handleLeftClick(i)}
                className="!py-2 text-sm"
                style={{
                  borderColor: selectedLeft === i ? 'var(--color-primary)' : color || 'var(--glass-border)',
                  borderWidth: selectedLeft === i ? 2 : 1,
                }}
              >
                <div className="flex items-center gap-2">
                  {num && color ? <Badge color={color} num={num} /> : (
                    <span className="w-5 h-5 rounded-full border border-[var(--glass-border)] shrink-0" />
                  )}
                  <span>{pair.left}</span>
                </div>
              </GlassCard>
            )
          })}
        </div>
        <div className="flex flex-col gap-2">
          {shuffledRight.map((origIdx, shuffIdx) => {
            const matchedLeft = [...matches.entries()].find(([, v]) => v === shuffIdx)?.[0]
            const color = matchedLeft !== undefined ? pairColor(matchedLeft) : null
            const num = matchedLeft !== undefined ? pairNum(matchedLeft) : null
            const isTarget = selectedLeft !== null && !([...matches.values()].includes(shuffIdx))
            return (
              <GlassCard
                key={shuffIdx}
                onClick={() => handleRightClick(shuffIdx)}
                className="!py-2 text-sm"
                style={{
                  borderColor: color || (isTarget ? 'var(--color-primary-30)' : 'var(--glass-border)'),
                  opacity: isTarget ? 1 : (selectedLeft !== null && !color ? 0.5 : 1),
                }}
              >
                <div className="flex items-center gap-2">
                  {num && color ? <Badge color={color} num={num} /> : (
                    <span className="w-5 h-5 rounded-full border border-[var(--glass-border)] shrink-0" />
                  )}
                  <span>{content.pairs[origIdx].right}</span>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
