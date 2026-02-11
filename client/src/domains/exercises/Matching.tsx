import { useState } from 'react'
import { GlassCard, GlassButton } from '~/design-system'

type Pair = { left: string; right: string }
type Content = { prompt: string; pairs: Pair[] }

type Props = {
  content: Content
  onAnswer: (matches: number[], correct: boolean) => void
}

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

  function handleRightClick(rightIdx: number) {
    if (submitted || selectedLeft === null) return
    const next = new Map(matches)
    next.set(selectedLeft, rightIdx)
    setMatches(next)
    setSelectedLeft(null)
  }

  function handleSubmit() {
    const matchArr = content.pairs.map((_, i) => matches.get(i) ?? -1)
    const correct = matchArr.every((rightShuffledIdx, leftIdx) => {
      return shuffledRight[rightShuffledIdx] === leftIdx
    })
    setSubmitted(true)
    onAnswer(matchArr, correct)
  }

  const allMatched = matches.size === content.pairs.length

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{content.prompt}</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          {content.pairs.map((pair, i) => (
            <GlassCard
              key={i}
              onClick={submitted ? undefined : () => setSelectedLeft(i)}
              className="!py-2 text-sm text-center"
              style={{
                borderColor: selectedLeft === i ? 'var(--color-primary)' : matches.has(i) ? 'var(--color-teal)' : 'var(--glass-border)',
              }}
            >
              {pair.left}
            </GlassCard>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {shuffledRight.map((origIdx, shuffIdx) => (
            <GlassCard
              key={shuffIdx}
              onClick={() => handleRightClick(shuffIdx)}
              className="!py-2 text-sm text-center"
              style={{
                borderColor: [...matches.values()].includes(shuffIdx) ? 'var(--color-teal)' : 'var(--glass-border)',
              }}
            >
              {content.pairs[origIdx].right}
            </GlassCard>
          ))}
        </div>
      </div>
      {!submitted && (
        <GlassButton onClick={handleSubmit} disabled={!allMatched} fullWidth>
          Check Matches
        </GlassButton>
      )}
    </div>
  )
}
