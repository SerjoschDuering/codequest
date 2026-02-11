import type { ReactNode, CSSProperties } from 'react'

type Props = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  padding?: boolean
}

export function GlassCard({ children, className = '', style, onClick, padding = true }: Props) {
  return (
    <div
      className={`glass ${padding ? 'p-4' : ''} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      style={{
        transition: 'transform 0.2s var(--spring-bounce)',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
