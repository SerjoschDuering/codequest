import { useState, useRef, useCallback } from 'react'

type Content = { prompt: string; items: string[]; explanation?: string }

type Props = {
  content: Content
  onAnswer: (order: string[], correct: boolean) => void
}

export function Sequencing({ content, onAnswer }: Props) {
  const [items, setItems] = useState(() => {
    // Track original indices so keys survive reorder + duplicates
    const arr = content.items.map((text, i) => ({ text, origIdx: i }))
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })
  const [submitted, setSubmitted] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const touchState = useRef({ startY: 0, idx: null as number | null, el: null as HTMLElement | null })

  const moveItem = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  function handleDragStart(e: React.DragEvent, idx: number) {
    if (submitted) return
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
    ;(e.currentTarget as HTMLElement).style.opacity = '0.4'
  }

  function handleDragEnd(e: React.DragEvent) {
    ;(e.currentTarget as HTMLElement).style.opacity = '1'
    setDragIdx(null)
    setOverIdx(null)
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(idx)
  }

  function handleDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault()
    if (dragIdx !== null) moveItem(dragIdx, toIdx)
    setDragIdx(null)
    setOverIdx(null)
  }

  function handleTouchStart(e: React.TouchEvent, idx: number) {
    if (submitted) return
    const touch = e.touches[0]
    const el = e.currentTarget as HTMLElement
    touchState.current = { startY: touch.clientY, idx, el }
    setDragIdx(idx)
    el.style.zIndex = '50'
    el.style.transition = 'none'
  }

  function handleTouchMove(e: React.TouchEvent, idx: number) {
    if (touchState.current.idx === null) return
    e.preventDefault()
    const touch = e.touches[0]
    const el = touchState.current.el!
    const dy = touch.clientY - touchState.current.startY
    el.style.transform = `translateY(${dy}px) scale(1.03)`
    const parent = el.parentElement!
    const children = [...parent.children] as HTMLElement[]
    for (let i = 0; i < children.length; i++) {
      if (i === idx) continue
      const rect = children[i].getBoundingClientRect()
      if (touch.clientY > rect.top && touch.clientY < rect.bottom) {
        setOverIdx(i)
        break
      }
    }
  }

  function handleTouchEnd(_e: React.TouchEvent, idx: number) {
    const el = touchState.current.el
    if (el) {
      el.style.transform = ''
      el.style.zIndex = ''
      el.style.transition = ''
    }
    if (overIdx !== null && overIdx !== idx) moveItem(idx, overIdx)
    touchState.current = { startY: 0, idx: null, el: null }
    setDragIdx(null)
    setOverIdx(null)
  }

  function handleSubmit() {
    if (submitted) return
    const texts = items.map(it => it.text)
    const correct = texts.every((t, i) => t === content.items[i])
    setSubmitted(true)
    setTimeout(() => onAnswer(texts, correct), 400)
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{content.prompt}</h3>
      <p className="text-xs text-[var(--text-secondary)]">Drag to reorder</p>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => {
          const isOver = overIdx === i && dragIdx !== i
          const isDragging = dragIdx === i
          return (
            <div
              key={item.origIdx}
              draggable={!submitted}
              onDragStart={e => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={e => handleDrop(e, i)}
              onTouchStart={e => handleTouchStart(e, i)}
              onTouchMove={e => handleTouchMove(e, i)}
              onTouchEnd={e => handleTouchEnd(e, i)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm
                cursor-grab active:cursor-grabbing select-none
                transition-all duration-150
                ${isDragging ? 'opacity-40' : 'opacity-100'}
                ${isOver ? 'border-t-2 !border-t-[var(--color-primary)]' : ''}`}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(var(--glass-blur))',
                WebkitBackdropFilter: 'blur(var(--glass-blur))',
                touchAction: 'none',
              }}
            >
              <span className="w-6 h-6 rounded-full bg-[var(--glass-border)] text-[var(--text-secondary)] text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="flex-1">{item.text}</span>
              <span className="text-[var(--text-secondary)] text-base shrink-0">&#x2807;</span>
            </div>
          )
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'var(--color-primary)' }}
        >
          Check Order
        </button>
      )}

      {submitted && content.explanation && (
        <p className="text-[13px] text-[var(--text-secondary)]">{content.explanation}</p>
      )}
    </div>
  )
}
