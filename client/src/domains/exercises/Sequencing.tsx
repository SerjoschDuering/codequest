import { useState } from 'react'
import { GlassCard, GlassButton } from '~/design-system'

type Content = { prompt: string; items: string[]; explanation?: string }

type Props = {
  content: Content
  onAnswer: (order: string[], correct: boolean) => void
}

export function Sequencing({ content, onAnswer }: Props) {
  const [shuffled] = useState(() => {
    const arr = [...content.items]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })
  const [order, setOrder] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  function toggleItem(item: string) {
    if (submitted) return
    if (order.includes(item)) {
      setOrder(order.filter(i => i !== item))
    } else {
      setOrder([...order, item])
    }
  }

  function handleSubmit() {
    const correct = order.every((item, i) => item === content.items[i])
    setSubmitted(true)
    onAnswer(order, correct)
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{content.prompt}</h3>
      {order.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-secondary)] mb-1">Your order:</span>
          {order.map((item, i) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center">
                {i + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {shuffled.map((item) => {
          const idx = order.indexOf(item)
          const isSelected = idx !== -1
          return (
            <GlassCard
              key={item}
              onClick={() => toggleItem(item)}
              className="!py-2 text-sm"
              style={{
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--glass-border)',
                opacity: isSelected ? 0.5 : 1,
              }}
            >
              {item}
            </GlassCard>
          )
        })}
      </div>
      {submitted && content.explanation && (
        <p className="text-[13px] text-[var(--text-secondary)]">{content.explanation}</p>
      )}
      {!submitted && (
        <GlassButton onClick={handleSubmit} disabled={order.length !== content.items.length} fullWidth>
          Check Order
        </GlassButton>
      )}
    </div>
  )
}
