import { createFileRoute } from '@tanstack/react-router'
import { GlassCard, GlassButton, ProgressRing } from '~/design-system'
import { useUserStats } from '~/domains/gamification/api'
import { StreakDisplay } from '~/domains/gamification/StreakDisplay'
import { XPBar } from '~/domains/gamification/XPBar'
import { useSession } from '~/components/ProtectedRoute'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const session = useSession()
  const stats = useUserStats()
  const user = session.data?.user

  async function handleSignOut() {
    await fetch('/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
      headers: { Origin: window.location.origin },
    })
    window.location.reload()
  }

  return (
    <div className="px-4 pt-12 max-w-lg mx-auto flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Avatar + name */}
      <GlassCard className="flex items-center gap-4">
        <ProgressRing
          progress={Math.min(((stats.data?.totalXp ?? 0) % 100), 100)}
          size={56}
          color="var(--color-primary)"
        >
          <span className="text-xl">👤</span>
        </ProgressRing>
        <div>
          <h2 className="font-semibold text-lg">{user?.name}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
        </div>
      </GlassCard>

      {/* Level + XP */}
      <GlassCard>
        <XPBar totalXp={stats.data?.totalXp ?? 0} level={stats.data?.level ?? 1} />
      </GlassCard>

      {/* Streak */}
      <GlassCard>
        <StreakDisplay
          currentStreak={stats.data?.currentStreak ?? 0}
          longestStreak={stats.data?.longestStreak ?? 0}
        />
      </GlassCard>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="text-center">
          <div className="text-xl font-bold">{stats.data?.totalXp ?? 0}</div>
          <div className="text-xs text-[var(--text-secondary)]">Total XP</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-xl font-bold">{stats.data?.longestStreak ?? 0}</div>
          <div className="text-xs text-[var(--text-secondary)]">Best Streak</div>
        </GlassCard>
      </div>

      <GlassButton variant="danger" onClick={handleSignOut} fullWidth>
        Sign Out
      </GlassButton>
    </div>
  )
}
