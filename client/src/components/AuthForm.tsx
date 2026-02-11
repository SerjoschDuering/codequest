import { useState } from 'react'
import { GlassCard, GlassButton } from '~/design-system'

type Props = {
  onSuccess: () => void
}

export function AuthForm({ onSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = mode === 'signup' ? '/auth/sign-up/email' : '/auth/sign-in/email'
    const body = mode === 'signup'
      ? { name, email, password }
      : { email, password }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { message?: string }).message || 'Auth failed')
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="max-w-sm mx-auto mt-12">
      <h2 className="text-xl font-bold mb-4">
        {mode === 'signin' ? 'Welcome back' : 'Create account'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            type="text" placeholder="Name" value={name}
            onChange={(e) => setName(e.target.value)} required
            className="px-4 py-3 rounded-xl bg-[var(--surface-primary)] border border-[var(--glass-border)] text-[var(--text-primary)]"
          />
        )}
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className="px-4 py-3 rounded-xl bg-[var(--surface-primary)] border border-[var(--glass-border)] text-[var(--text-primary)]"
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={8}
          className="px-4 py-3 rounded-xl bg-[var(--surface-primary)] border border-[var(--glass-border)] text-[var(--text-primary)]"
        />
        {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
        <GlassButton type="submit" fullWidth disabled={loading}>
          {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </GlassButton>
      </form>
      <button
        className="mt-3 text-sm text-[var(--color-primary)] bg-transparent border-none cursor-pointer"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
      </button>
    </GlassCard>
  )
}
