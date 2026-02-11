import { useEffect, useState } from 'react'

type Props = {
  xp: number
  show: boolean
  onDone?: () => void
}

export function XPPopup({ xp, show, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const t = setTimeout(() => {
        setVisible(false)
        onDone?.()
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [show, onDone])

  if (!visible) return null

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold text-lg text-white"
      style={{
        background: 'var(--color-warning)',
        animation: 'xpPop 1.5s var(--spring-bounce) forwards',
      }}
    >
      +{xp} XP
    </div>
  )
}
