import type { ReactNode, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'success' | 'danger'

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--color-primary)] text-white',
  secondary: 'glass text-[var(--text-primary)]',
  success: 'bg-[var(--color-success)] text-white',
  danger: 'bg-[var(--color-danger)] text-white',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
  fullWidth?: boolean
}

export function GlassButton({ variant = 'primary', children, fullWidth, className = '', ...props }: Props) {
  return (
    <button
      className={`
        px-6 py-3 rounded-xl font-semibold text-[15px]
        active:scale-[0.96] transition-transform duration-200
        disabled:opacity-50 disabled:pointer-events-none
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
      {...props}
    >
      {children}
    </button>
  )
}
