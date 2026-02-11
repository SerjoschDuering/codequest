import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AuthForm } from './AuthForm'

async function fetchSession() {
  const res = await fetch('/auth/get-session', { credentials: 'include' })
  if (!res.ok) throw new Error('Not authenticated')
  const data = await res.json()
  return data as { user: { id: string; name: string; email: string } }
}

export function useSession() {
  return useQuery({ queryKey: ['session'], queryFn: fetchSession, retry: false })
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refetch } = useSession()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen px-4 py-8" style={{ background: 'var(--surface-primary)' }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">CodeQuest</h1>
          <p className="text-[var(--text-secondary)] mt-1">Learn coding concepts, the fun way</p>
        </div>
        <AuthForm onSuccess={() => refetch()} />
      </div>
    )
  }

  return <>{children}</>
}
